import { AlertCircle, Inbox, MessageSquareText, RefreshCw, SearchX } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAdminToast } from '../components/admin/AdminToasts.jsx'
import { AdminPageHeader, Button, ConfirmDialog } from '../components/admin/adminUi.jsx'
import { ReviewDetailDrawer } from '../components/admin/reviews/ReviewDetailDrawer.jsx'
import { ListSkeleton, Pagination, ReviewsList } from '../components/admin/reviews/ReviewsList.jsx'
import { ReviewsOverview } from '../components/admin/reviews/ReviewsOverview.jsx'
import { ReviewsToolbar } from '../components/admin/reviews/ReviewsToolbar.jsx'
import {
  FILTER_DEFAULTS,
  PAGE_SIZE,
  hasRefinements,
  matchesRefinements,
  matchesStatus,
  productOptions,
  readFilters,
  sortReviews,
  summarize,
} from '../components/admin/reviews/reviewFilters.js'
import { useAdminReviews } from '../context/AdminReviewsContext'
import { deleteReview } from '../services/adminService.js'
import { ApiError } from '../services/api.js'

// Matches the row slide-out in ReviewsList (duration-200) plus a short pause.
const LEAVE_MS = 240
const FLASH_MS = 1400

const STATUS_DONE = {
  Approved: 'dərc olundu',
  Rejected: 'rədd edildi',
  Pending: 'gözləməyə qaytarıldı',
}

const CLEARED_REFINEMENTS = { q: '', rating: '', product: '', verified: '', from: '', to: '', page: '1' }

const formatTime = (date) => `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`

function describeReviewError(error, fallback) {
  if (error instanceof ApiError) {
    if (error.status === 403) return 'Admin icazəniz yoxdur.'
    if (error.status === 404) return 'Rəy tapılmadı — siyahını yeniləyin.'
    if (error.status === 0) return 'Serverə qoşulmaq mümkün olmadı.'
  }
  return fallback
}

const withId = (set, id) => new Set(set).add(id)
const withoutId = (set, id) => {
  const next = new Set(set)
  next.delete(id)
  return next
}

/**
 * /admin/reyler — review moderation. Data: GET /api/admin/reviews (every status, filtered here);
 * actions: PATCH /api/admin/reviews/{id}/status. Filters and the open review live in the URL query.
 */
export function AdminReviewsPage() {
  const { status, reviews, error, loadedAt, refreshing, reload, saveStatus, applyReview, removeReview } = useAdminReviews()
  const { toast } = useAdminToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const [busyIds, setBusyIds] = useState(() => new Set())
  const [leavingIds, setLeavingIds] = useState(() => new Set())
  const [flashId, setFlashId] = useState(null)
  // The review shown in the panel; kept after closing so the panel can slide out with its content.
  const [shownReview, setShownReview] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const filters = readFilters(searchParams)
  const detailId = searchParams.get('id')

  // Values equal to the default are removed, so the URL only carries what differs.
  const setParams = useCallback(
    (patch, { push = false } = {}) =>
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          for (const [key, value] of Object.entries(patch)) {
            if (!value || value === FILTER_DEFAULTS[key]) next.delete(key)
            else next.set(key, value)
          }
          return next
        },
        { replace: !push },
      ),
    [setSearchParams],
  )

  const changeFilter = (key, value) => setParams({ [key]: value, page: key === 'page' ? value : '1' })

  // Status counts respect every other filter; the rating panel respects everything except the star filter itself.
  const refined = reviews.filter((review) => matchesRefinements(review, filters))
  const statusCounts = summarize(refined).counts
  const ratingBaseFilters = { ...filters, rating: '' }
  const ratingSummary = summarize(
    reviews.filter((review) => matchesStatus(review, filters.status) && matchesRefinements(review, ratingBaseFilters)),
  )
  const sorted = sortReviews(
    refined.filter((review) => matchesStatus(review, filters.status)),
    filters.sort,
  )

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const page = Math.min(Math.max(Number(filters.page) || 1, 1), pageCount)
  const pageItems = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const selected = detailId ? (reviews.find((review) => review.id === detailId) ?? null) : null
  if (selected && selected !== shownReview) setShownReview(selected)
  const selectedIndex = selected ? sorted.findIndex((review) => review.id === selected.id) : -1

  const openReview = (review) => setParams({ id: review.id }, { push: !detailId })
  const closeReview = useCallback(() => setParams({ id: '' }), [setParams])
  const goTo = (index) => {
    const target = sorted[index]
    if (!target) return
    setParams({ id: target.id, page: String(Math.floor(index / PAGE_SIZE) + 1) })
  }

  const flash = (id) => {
    setFlashId(id)
    setTimeout(() => setFlashId((current) => (current === id ? null : current)), FLASH_MS)
  }

  const changeStatus = async (review, nextStatus, { undo = false } = {}) => {
    const previousStatus = review.status
    const leaves = !matchesStatus({ ...review, status: nextStatus }, filters.status)
    // In the open panel, a review that leaves the current list hands over to the one after it.
    const index = sorted.findIndex((item) => item.id === review.id)
    const successor = leaves && detailId === review.id && index >= 0 ? (sorted[index + 1] ?? sorted[index - 1]) : null

    setBusyIds((current) => withId(current, review.id))
    try {
      const updated = await saveStatus(review.id, nextStatus)
      if (leaves) {
        setLeavingIds((current) => withId(current, review.id))
        if (successor) setParams({ id: successor.id })
        setTimeout(() => {
          applyReview(updated)
          setLeavingIds((current) => withoutId(current, review.id))
        }, LEAVE_MS)
      } else {
        applyReview(updated)
        flash(updated.id)
      }
      toast({
        message: undo ? 'Dəyişiklik geri alındı.' : `${review.userName} rəyi ${STATUS_DONE[nextStatus]}.`,
        tone: undo ? 'info' : 'success',
        action: undo ? null : { label: 'Geri al', onClick: () => changeStatus(updated, previousStatus, { undo: true }) },
      })
    } catch (err) {
      toast({ message: describeReviewError(err, 'Status dəyişdirilmədi. Yenidən cəhd edin.'), tone: 'error' })
    } finally {
      setBusyIds((current) => withoutId(current, review.id))
    }
  }

  // Permanent: no undo toast, so the dialog says so before anything is sent.
  const confirmDelete = async () => {
    const review = pendingDelete
    const index = sorted.findIndex((item) => item.id === review.id)
    const successor = detailId === review.id && index >= 0 ? (sorted[index + 1] ?? sorted[index - 1]) : null

    setDeleting(true)
    setBusyIds((current) => withId(current, review.id))
    try {
      await deleteReview(review.id)
      setPendingDelete(null)
      if (detailId === review.id) setParams({ id: successor?.id ?? '' })
      setLeavingIds((current) => withId(current, review.id))
      setTimeout(() => {
        removeReview(review.id)
        setLeavingIds((current) => withoutId(current, review.id))
      }, LEAVE_MS)
      toast({ message: `${review.userName} rəyi silindi.` })
    } catch (err) {
      setPendingDelete(null)
      toast({ message: describeReviewError(err, 'Rəy silinmədi. Yenidən cəhd edin.'), tone: 'error' })
    } finally {
      setDeleting(false)
      setBusyIds((current) => withoutId(current, review.id))
    }
  }

  const ready = status === 'ready' && reviews.length > 0

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        eyebrow="Moderasiya"
        title="Rəylər"
        description="Müştəri rəyləri yalnız təsdiqləndikdən sonra məhsul səhifəsində dərc olunur."
        actions={
          status !== 'loading' && (
            <>
              {loadedAt && (
                <span className="text-[11px] text-ink-400">Yeniləndi · {formatTime(loadedAt)}</span>
              )}
              <Button size="sm" onClick={reload} disabled={refreshing} aria-label="Siyahını yenilə">
                <RefreshCw size={13} strokeWidth={1.75} className={refreshing ? 'animate-spin' : ''} />
                Yenilə
              </Button>
            </>
          )
        }
      />

      {status === 'ready' && error && (
        <p role="alert" className="mt-6 flex items-center gap-2 border border-clay-600/30 bg-clay-50 px-4 py-3 text-xs text-clay-700">
          <AlertCircle size={14} strokeWidth={1.75} />
          Siyahı yenilənmədi; ekranda son yüklənmiş məlumatlar göstərilir.
        </p>
      )}

      {ready && (
        <>
          <ReviewsOverview
            statusCounts={statusCounts}
            ratingSummary={ratingSummary}
            filters={filters}
            filtered={hasRefinements(ratingBaseFilters)}
            onStatusChange={(value) => changeFilter('status', value)}
            onRatingChange={(value) => changeFilter('rating', value)}
          />
          <ReviewsToolbar
            filters={filters}
            products={productOptions(reviews)}
            resultCount={sorted.length}
            onChange={changeFilter}
            onClear={() => setParams(CLEARED_REFINEMENTS)}
          />
        </>
      )}

      {status === 'loading' && <ListSkeleton />}

      {status === 'error' && (
        <EmptyState
          icon={AlertCircle}
          title={error instanceof ApiError && error.status === 403 ? 'Admin icazəniz yoxdur' : 'Rəylər yüklənmədi'}
          text={
            error instanceof ApiError && error.status === 0
              ? 'Serverə qoşulmaq mümkün olmadı. API-nin işlədiyini yoxlayın.'
              : 'Bir az sonra yenidən cəhd edin.'
          }
          action={<Button onClick={reload}>Yenidən cəhd et</Button>}
        />
      )}

      {status === 'ready' && reviews.length === 0 && (
        <EmptyState
          icon={MessageSquareText}
          title="Hələ heç bir rəy yazılmayıb"
          text="Müştərilər məhsul səhifəsində rəy yazdıqca onlar moderasiya üçün burada görünəcək."
        />
      )}

      {ready && sorted.length === 0 && (
        hasRefinements(filters) ? (
          <EmptyState
            icon={SearchX}
            title="Filtrlərə uyğun rəy tapılmadı"
            text="Axtarışı dəyişin və ya filtrləri təmizləyin."
            action={<Button onClick={() => setParams(CLEARED_REFINEMENTS)}>Filtrləri təmizlə</Button>}
          />
        ) : (
          <EmptyState
            icon={Inbox}
            title={filters.status === 'Pending' ? 'Moderasiya növbəsi boşdur' : 'Bu statusda rəy yoxdur'}
            text={filters.status === 'Pending' ? 'Bütün rəylərə baxılıb.' : 'Başqa statusa keçin.'}
            action={<Button onClick={() => changeFilter('status', 'all')}>Bütün rəylərə bax</Button>}
          />
        )
      )}

      {ready && sorted.length > 0 && (
        <>
          <ReviewsList
            reviews={pageItems}
            selectedId={detailId}
            busyIds={busyIds}
            leavingIds={leavingIds}
            flashId={flashId}
            onOpen={openReview}
            onChangeStatus={changeStatus}
            onDelete={setPendingDelete}
          />
          <Pagination
            page={page}
            pageCount={pageCount}
            total={sorted.length}
            pageSize={PAGE_SIZE}
            onPageChange={(value) => changeFilter('page', String(value))}
          />
        </>
      )}

      <ReviewDetailDrawer
        review={selected ?? shownReview}
        open={Boolean(selected)}
        position={selectedIndex >= 0 ? { index: selectedIndex, total: sorted.length } : null}
        busy={selected ? busyIds.has(selected.id) : false}
        onClose={closeReview}
        onPrev={selectedIndex > 0 ? () => goTo(selectedIndex - 1) : null}
        onNext={selectedIndex >= 0 && selectedIndex < sorted.length - 1 ? () => goTo(selectedIndex + 1) : null}
        onChangeStatus={changeStatus}
        onDelete={setPendingDelete}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Rəy həmişəlik silinsin?"
        confirmLabel="Rəyi sil"
        busy={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      >
        <strong className="font-medium text-ink-900">{pendingDelete?.userName}</strong> —{' '}
        {pendingDelete?.productName}
        <span className="mt-2 block line-clamp-3 border-l-2 border-linen-200 pl-3 italic text-ink-500">
          “{pendingDelete?.comment}”
        </span>
        <span className="mt-3 block">
          Bu əməliyyat geri qaytarıla bilməz. Rəyi yalnız saytdan gizlətmək istəyirsinizsə, rədd edin.
        </span>
      </ConfirmDialog>
    </div>
  )
}

function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="mt-8 flex animate-fade-up flex-col items-center border border-dashed border-ink-900/15 px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-ink-900/10 bg-linen-100 text-ink-500">
        <Icon size={20} strokeWidth={1.25} />
      </span>
      <p className="mt-5 font-display text-xl text-ink-900">{title}</p>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-500">{text}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
