import { AlertCircle, Download, MailCheck, MailX, RefreshCw, Trash2, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useAdminToast } from '../components/admin/AdminToasts.jsx'
import {
  ActionMenu,
  AdminPageHeader,
  Button,
  ConfirmDialog,
  EmptyState,
  FilterField,
  StaleNotice,
  StatStrip,
  TextInput,
  ToneBadge,
} from '../components/admin/adminUi.jsx'
import { ListSkeleton } from '../components/admin/reviews/ReviewsList.jsx'
import { formatDateTime, formatTime, useAdminList } from '../components/admin/useAdminList.js'
import { deleteNewsletterSubscriber, getNewsletterSubscribers, setNewsletterSubscriberActive } from '../services/adminService.js'

/** Active addresses as a one-column CSV, for importing into a mailing tool. */
function downloadCsv(subscribers) {
  const rows = ['email,subscribedAt', ...subscribers.map((s) => `${s.email},${new Date(s.subscribedAt).toISOString()}`)]
  const url = URL.createObjectURL(new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8' }))
  const link = Object.assign(document.createElement('a'), { href: url, download: 'khazar-abuneciler.csv' })
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * /admin/abuneciler — newsletter addresses from the footer form: search, unsubscribe / reactivate (no email is
 * sent), delete completely (e.g. on an erasure request) and export the active ones as CSV.
 */
export function AdminSubscribersPage() {
  const { toast } = useAdminToast()
  const list = useAdminList(getNewsletterSubscribers)
  const [filter, setFilter] = useState('active')
  const [query, setQuery] = useState('')
  const [deleting, setDeleting] = useState(null)
  const [deleteBusy, setDeleteBusy] = useState(false)

  const subscribers = list.items
  const active = subscribers.filter((s) => s.isActive)
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return subscribers.filter(
      (s) => (filter === 'all' || (filter === 'active') === s.isActive) && (!needle || s.email.includes(needle)),
    )
  }, [subscribers, filter, query])

  const setActive = async (subscriber, isActive) => {
    try {
      const updated = await setNewsletterSubscriberActive(subscriber.id, isActive)
      list.setItems((items) => items.map((item) => (item.id === updated.id ? updated : item)))
      toast({ message: isActive ? `${updated.email} yenidən abunədir.` : `${updated.email} abunəlikdən çıxarıldı.` })
    } catch {
      toast({ message: 'Status dəyişmədi.', tone: 'error' })
    }
  }

  const confirmDelete = async () => {
    const subscriber = deleting
    setDeleteBusy(true)
    try {
      await deleteNewsletterSubscriber(subscriber.id)
      list.setItems((items) => items.filter((item) => item.id !== subscriber.id))
      toast({ message: `${subscriber.email} siyahıdan silindi.` })
    } catch {
      toast({ message: 'Silinmədi.', tone: 'error' })
    } finally {
      setDeleting(null)
      setDeleteBusy(false)
    }
  }

  const ready = list.status === 'ready'

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        eyebrow="Müştərilər"
        title="Abunəçilər"
        description="Footer-dəki xəbər bülleteni formasından gələn ünvanlar. Abunəlikdən çıxan ünvan siyahıda qalır; tam silmək də mümkündür."
        actions={
          <>
            {list.loadedAt && <span className="text-[11px] text-ink-400">Yeniləndi · {formatTime(list.loadedAt)}</span>}
            <Button size="sm" onClick={list.reload} disabled={list.refreshing || list.status === 'loading'}>
              <RefreshCw size={13} strokeWidth={1.75} className={list.refreshing ? 'animate-spin' : ''} />
              Yenilə
            </Button>
            <Button size="sm" onClick={() => downloadCsv(active)} disabled={!ready || active.length === 0}>
              <Download size={13} strokeWidth={1.75} />
              CSV
            </Button>
          </>
        }
      />

      {ready && list.error && <StaleNotice />}
      {list.status === 'loading' && <ListSkeleton />}
      {list.status === 'error' && (
        <EmptyState
          icon={AlertCircle}
          title="Abunəçilər yüklənmədi"
          text="Bir az sonra yenidən cəhd edin."
          action={<Button onClick={list.reload}>Yenidən cəhd et</Button>}
        />
      )}

      {ready && (
        <div className="mt-8">
          <StatStrip
            label="Abunəçi filtri"
            value={filter}
            onChange={setFilter}
            cells={[
              { value: 'active', label: 'Aktiv', count: active.length, accent: 'sage' },
              { value: 'inactive', label: 'Çıxıb', count: subscribers.length - active.length, accent: 'muted' },
              { value: 'all', label: 'Hamısı', count: subscribers.length },
            ]}
          />

          <FilterField label="Axtarış" className="mt-6 max-w-sm">
            <TextInput value={query} onChange={(event) => setQuery(event.target.value.toLowerCase())} placeholder="e-poçt" />
          </FilterField>

          {visible.length === 0 ? (
            <EmptyState icon={Users} title="Ünvan yoxdur" text="Filtrə uyğun abunəçi tapılmadı." />
          ) : (
            <ul className="mt-6 divide-y divide-linen-200 border-y border-linen-200">
              {visible.map((subscriber) => (
                <li key={subscriber.id} className="flex items-center gap-4 px-2 py-3">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-ink-900">{subscriber.email}</span>
                    <span className="block text-[11px] text-ink-400">
                      {subscriber.isActive
                        ? `Abunə · ${formatDateTime(subscriber.subscribedAt)}`
                        : `Çıxıb · ${formatDateTime(subscriber.unsubscribedAt)}`}
                    </span>
                  </span>
                  <ToneBadge tone={subscriber.isActive ? 'sage' : 'muted'}>{subscriber.isActive ? 'Aktiv' : 'Çıxıb'}</ToneBadge>
                  <ActionMenu
                    label={`${subscriber.email} üçün əməliyyatlar`}
                    items={[
                      subscriber.isActive
                        ? { label: 'Abunəlikdən çıxar', icon: MailX, onSelect: () => setActive(subscriber, false) }
                        : { label: 'Yenidən abunə et', icon: MailCheck, hint: 'Xoş gəldin məktubu göndərilmir', onSelect: () => setActive(subscriber, true) },
                      { label: 'Tam sil', icon: Trash2, tone: 'danger', hint: 'Geri qaytarıla bilməz', onSelect: () => setDeleting(subscriber) },
                    ]}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        title={`${deleting?.email} silinsin?`}
        confirmLabel="Tam sil"
        busy={deleteBusy}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      >
        Ünvan siyahıdan həmişəlik silinəcək. Sonra yenidən abunə olsa, yeni abunəçi kimi qeyd olunacaq.
      </ConfirmDialog>
    </div>
  )
}
