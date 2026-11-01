import { AlertCircle, ExternalLink, Package, Pencil, Plus, RefreshCw, Tags, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminToast } from '../components/admin/AdminToasts.jsx'
import { ActionMenu, AdminPageHeader, Button, ConfirmDialog, microLabelClass } from '../components/admin/adminUi.jsx'
import { CategoryEditorDrawer } from '../components/admin/categories/CategoryEditorDrawer.jsx'
import { describeCategoryError } from '../components/admin/categories/categoryForm.js'
import { ListSkeleton } from '../components/admin/reviews/ReviewsList.jsx'
import { deleteCategory, getAdminCategories } from '../services/adminService.js'
import { ApiError } from '../services/api.js'

const FLASH_MS = 1400
const SORT_STEP = 10

const formatTime = (date) => `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`

// Same order as the API and the storefront tabs: sort order, then key.
const byStorefrontOrder = (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'az')

/**
 * /admin/kateqoriyalar — category management against /api/admin/categories: create, edit (label, key, slug, order)
 * and delete. A category that still has products cannot be deleted; the menu links to those products instead.
 */
export function AdminCategoriesPage() {
  const { toast } = useAdminToast()
  const navigate = useNavigate()
  const [state, setState] = useState({ status: 'loading', categories: [], error: null, loadedAt: null, refreshing: false })
  const [reloadKey, setReloadKey] = useState(0)
  const [editor, setEditor] = useState({ open: false, category: null, key: 0 })
  const [deleting, setDeleting] = useState(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [flashId, setFlashId] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    getAdminCategories({ signal: controller.signal })
      .then((categories) => setState({ status: 'ready', categories, error: null, loadedAt: new Date(), refreshing: false }))
      .catch((error) => {
        if (error.name === 'AbortError') return
        setState((current) => ({ ...current, status: current.loadedAt ? 'ready' : 'error', error, refreshing: false }))
      })
    return () => controller.abort()
  }, [reloadKey])

  const reload = () => {
    setState((current) => ({ ...current, refreshing: true, error: null }))
    setReloadKey((current) => current + 1)
  }

  const { categories } = state
  const nextSortOrder = categories.length ? Math.max(...categories.map((c) => c.sortOrder)) + SORT_STEP : SORT_STEP
  const totalProducts = categories.reduce((sum, category) => sum + category.productCount, 0)

  const flash = (id) => {
    setFlashId(id)
    setTimeout(() => setFlashId((current) => (current === id ? null : current)), FLASH_MS)
  }

  const openCreate = () => setEditor((current) => ({ open: true, category: null, key: current.key + 1 }))
  const openEdit = (category) => setEditor((current) => ({ open: true, category, key: current.key + 1 }))
  const closeEditor = () => setEditor((current) => ({ ...current, open: false }))

  const onSaved = (saved, mode) => {
    closeEditor()
    setState((current) => ({
      ...current,
      categories: (mode === 'create'
        ? [...current.categories, saved]
        : current.categories.map((category) => (category.id === saved.id ? saved : category))
      ).sort(byStorefrontOrder),
    }))
    flash(saved.id)
    toast({ message: mode === 'create' ? `«${saved.label}» yaradıldı.` : `«${saved.label}» yadda saxlanıldı.` })
  }

  const confirmDelete = async () => {
    const category = deleting
    setDeleteBusy(true)
    try {
      await deleteCategory(category.id)
      setState((current) => ({ ...current, categories: current.categories.filter((c) => c.id !== category.id) }))
      toast({ message: `«${category.label}» silindi.` })
    } catch (error) {
      toast({ message: describeCategoryError(error).message, tone: 'error' })
      // e.g. a product was added to the category since the list was loaded.
      if (error instanceof ApiError && error.status === 409) reload()
    } finally {
      setDeleting(null)
      setDeleteBusy(false)
    }
  }

  const showProducts = (category) => navigate(`/admin/mehsullar?category=${encodeURIComponent(category.name)}`)

  const menuItems = (category) => [
    { label: 'Redaktə et', icon: Pencil, onSelect: () => openEdit(category) },
    {
      label: 'Məhsullarına bax',
      icon: Package,
      disabled: category.productCount === 0,
      hint: category.productCount === 0 ? 'Bu kateqoriyada məhsul yoxdur' : null,
      onSelect: () => showProducts(category),
    },
    {
      label: 'Mağazada bax',
      icon: ExternalLink,
      onSelect: () => window.open(`/katalog?kateqoriya=${encodeURIComponent(category.slug)}`, '_blank', 'noopener'),
    },
    {
      label: 'Sil',
      icon: Trash2,
      tone: 'danger',
      disabled: category.productCount > 0,
      hint: category.productCount > 0 ? 'Məhsulları var — əvvəlcə onları köçürün' : 'Geri qaytarıla bilməz',
      onSelect: () => setDeleting(category),
    },
  ]

  const ready = state.status === 'ready'

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        eyebrow="Kataloq"
        title="Kateqoriyalar"
        description="Mağazadakı kateqoriya tabları: görünən ad, URL slug-ı və sırası. Məhsulu olan kateqoriya silinmir — əvvəlcə məhsulları başqa kateqoriyaya keçirin."
        actions={
          <>
            {state.loadedAt && <span className="text-[11px] text-ink-400">Yeniləndi · {formatTime(state.loadedAt)}</span>}
            <Button size="sm" onClick={reload} disabled={state.refreshing || state.status === 'loading'} aria-label="Siyahını yenilə">
              <RefreshCw size={13} strokeWidth={1.75} className={state.refreshing ? 'animate-spin' : ''} />
              Yenilə
            </Button>
            <Button variant="primary" onClick={openCreate} disabled={!ready}>
              <Plus size={15} strokeWidth={1.75} />
              Yeni kateqoriya
            </Button>
          </>
        }
      />

      {ready && state.error && (
        <p role="alert" className="mt-6 flex items-center gap-2 border border-clay-600/30 bg-clay-50 px-4 py-3 text-xs text-clay-700">
          <AlertCircle size={14} strokeWidth={1.75} />
          Siyahı yenilənmədi; ekranda son yüklənmiş məlumatlar göstərilir.
        </p>
      )}

      {state.status === 'loading' && <ListSkeleton />}

      {state.status === 'error' && (
        <EmptyState
          icon={AlertCircle}
          title={state.error instanceof ApiError && state.error.status === 403 ? 'Admin icazəniz yoxdur' : 'Kateqoriyalar yüklənmədi'}
          text={state.error instanceof ApiError && state.error.status === 0 ? 'Serverə qoşulmaq mümkün olmadı.' : 'Bir az sonra yenidən cəhd edin.'}
          action={<Button onClick={reload}>Yenidən cəhd et</Button>}
        />
      )}

      {ready && categories.length === 0 && (
        <EmptyState
          icon={Tags}
          title="Kateqoriya yoxdur"
          text="Məhsul yaratmaq üçün ən azı bir kateqoriya lazımdır."
          action={
            <Button variant="primary" onClick={openCreate}>
              <Plus size={15} strokeWidth={1.75} />
              Yeni kateqoriya
            </Button>
          }
        />
      )}

      {ready && categories.length > 0 && (
        <>
          <p className="mt-8 text-[11px] tabular-nums text-ink-500">
            {categories.length} kateqoriya · {totalProducts} məhsul
          </p>

          <table className="mt-3 hidden w-full table-fixed border-collapse md:table">
            <thead>
              <tr className="border-b border-ink-900/10 text-left">
                <th scope="col" className={`${microLabelClass} w-[8%] pb-3 font-medium`}>Sıra</th>
                <th scope="col" className={`${microLabelClass} pb-3 font-medium`}>Kateqoriya</th>
                <th scope="col" className={`${microLabelClass} w-[24%] pb-3 font-medium`}>Slug</th>
                <th scope="col" className={`${microLabelClass} w-[14%] pb-3 font-medium`}>Məhsul</th>
                <th scope="col" className="w-[88px] pb-3">
                  <span className="sr-only">Əməliyyatlar</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr
                  key={category.id}
                  onClick={() => openEdit(category)}
                  className={`group cursor-pointer border-b border-linen-200 align-middle transition-colors duration-200 hover:bg-linen-100/60 ${
                    flashId === category.id ? 'animate-row-flash' : ''
                  }`}
                >
                  <td className="py-3.5 pr-4 text-sm tabular-nums text-ink-500">{category.sortOrder}</td>
                  <td className="py-3.5 pr-4">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        openEdit(category)
                      }}
                      className="block max-w-full truncate text-left text-sm text-ink-900 outline-none group-hover:underline group-hover:decoration-ink-900/30 group-hover:underline-offset-4 focus-visible:underline focus-visible:decoration-clay-500"
                    >
                      {category.label}
                    </button>
                    <p className="truncate font-mono text-[11px] text-ink-400">{category.name}</p>
                  </td>
                  <td className="truncate py-3.5 pr-4 font-mono text-[12px] text-ink-700">{category.slug}</td>
                  <td className="py-3.5 pr-4 text-sm tabular-nums">
                    {category.productCount > 0 ? (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          showProducts(category)
                        }}
                        className="text-ink-900 underline decoration-ink-900/20 underline-offset-4 transition-colors hover:decoration-clay-500"
                      >
                        {category.productCount}
                      </button>
                    ) : (
                      <span className="text-ink-400">0</span>
                    )}
                  </td>
                  <td className="py-3">
                    <div className="flex justify-end gap-1" onClick={(event) => event.stopPropagation()}>
                      <Button size="icon" variant="ghost" aria-label={`Redaktə et: ${category.label}`} title="Redaktə et" onClick={() => openEdit(category)}>
                        <Pencil size={14} strokeWidth={1.5} />
                      </Button>
                      <ActionMenu label={`${category.label} üçün əməliyyatlar`} items={menuItems(category)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <ul className="mt-3 space-y-3 md:hidden">
            {categories.map((category) => (
              <li
                key={category.id}
                className={`flex items-center gap-3 border border-linen-200 p-4 ${flashId === category.id ? 'animate-row-flash' : ''}`}
              >
                <span className="w-8 shrink-0 text-sm tabular-nums text-ink-400">{category.sortOrder}</span>
                <button type="button" onClick={() => openEdit(category)} className="min-w-0 flex-1 text-left">
                  <span className="block truncate text-sm text-ink-900">{category.label}</span>
                  <span className="block truncate font-mono text-[11px] text-ink-400">
                    {category.name} · /{category.slug} · {category.productCount} məhsul
                  </span>
                </button>
                <ActionMenu label={`${category.label} üçün əməliyyatlar`} items={menuItems(category)} />
              </li>
            ))}
          </ul>
        </>
      )}

      <CategoryEditorDrawer
        key={editor.key}
        open={editor.open}
        category={editor.category}
        nextSortOrder={nextSortOrder}
        onClose={closeEditor}
        onSaved={onSaved}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title={`«${deleting?.label}» silinsin?`}
        confirmLabel="Kateqoriyanı sil"
        busy={deleteBusy}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      >
        Bu əməliyyat geri qaytarıla bilməz. Kateqoriyada məhsul yoxdur, ona görə heç bir məhsula təsir etmir; mağazadakı
        <span className="font-mono text-[12px]"> ?kateqoriya={deleting?.slug}</span> linki isə artıq filtr tətbiq etməyəcək.
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
