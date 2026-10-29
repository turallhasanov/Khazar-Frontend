import { AlertCircle, Inbox, Mail, MailOpen, RefreshCw, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useAdminToast } from '../components/admin/AdminToasts.jsx'
import {
  AdminPageHeader,
  Button,
  ConfirmDialog,
  Drawer,
  DrawerCloseButton,
  EmptyState,
  StaleNotice,
  StatStrip,
  microLabelClass,
} from '../components/admin/adminUi.jsx'
import { ListSkeleton } from '../components/admin/reviews/ReviewsList.jsx'
import { formatDateTime, formatTime } from '../components/admin/useAdminList.js'
import { useAdminInbox } from '../context/AdminInboxContext'
import { deleteContactMessage, setContactMessageRead } from '../services/adminService.js'
import { ApiError } from '../services/api.js'

/**
 * /admin/mesajlar — messages from the storefront contact form. Opening a message marks it read; it can be marked
 * unread again, answered by email, or deleted.
 */
export function AdminMessagesPage() {
  const { toast } = useAdminToast()
  const inbox = useAdminInbox()
  const [filter, setFilter] = useState('all')
  const [openId, setOpenId] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [deleteBusy, setDeleteBusy] = useState(false)

  const messages = inbox.items
  const unread = messages.filter((message) => !message.isRead).length
  const visible = useMemo(
    () => messages.filter((message) => filter === 'all' || (filter === 'unread' ? !message.isRead : message.isRead)),
    [messages, filter],
  )
  const open = messages.find((message) => message.id === openId) ?? null
  const { setItems } = inbox

  const markUnread = async (message) => {
    try {
      const updated = await setContactMessageRead(message.id, false)
      setItems((items) => items.map((item) => (item.id === updated.id ? updated : item)))
    } catch (error) {
      toast({ message: error instanceof ApiError && error.status === 0 ? 'Serverə qoşulmaq mümkün olmadı.' : 'Status dəyişmədi.', tone: 'error' })
    }
  }

  // Opening an unread message marks it read (silently: the message is on screen either way).
  const openUnread = open && !open.isRead ? open : null
  useEffect(() => {
    if (!openUnread) return
    setContactMessageRead(openUnread.id, true)
      .then((updated) => setItems((items) => items.map((item) => (item.id === updated.id ? updated : item))))
      .catch(() => {})
  }, [openUnread, setItems])

  const confirmDelete = async () => {
    const message = deleting
    setDeleteBusy(true)
    try {
      await deleteContactMessage(message.id)
      setItems((items) => items.filter((item) => item.id !== message.id))
      setOpenId(null)
      toast({ message: `${message.name} göndərdiyi mesaj silindi.` })
    } catch {
      toast({ message: 'Mesaj silinmədi.', tone: 'error' })
    } finally {
      setDeleting(null)
      setDeleteBusy(false)
    }
  }

  const ready = inbox.status === 'ready'

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        eyebrow="Müştərilər"
        title="Mesajlar"
        description="Əlaqə səhifəsindən göndərilən müraciətlər. Cavab müştərinin e-poçtuna yazılır."
        actions={
          <>
            {inbox.loadedAt && <span className="text-[11px] text-ink-400">Yeniləndi · {formatTime(inbox.loadedAt)}</span>}
            <Button size="sm" onClick={inbox.reload} disabled={inbox.refreshing || inbox.status === 'loading'}>
              <RefreshCw size={13} strokeWidth={1.75} className={inbox.refreshing ? 'animate-spin' : ''} />
              Yenilə
            </Button>
          </>
        }
      />

      {ready && inbox.error && <StaleNotice />}
      {inbox.status === 'loading' && <ListSkeleton />}
      {inbox.status === 'error' && (
        <EmptyState
          icon={AlertCircle}
          title="Mesajlar yüklənmədi"
          text="Bir az sonra yenidən cəhd edin."
          action={<Button onClick={inbox.reload}>Yenidən cəhd et</Button>}
        />
      )}

      {ready && (
        <div className="mt-8">
          <StatStrip
            label="Mesaj filtri"
            value={filter}
            onChange={setFilter}
            cells={[
              { value: 'all', label: 'Hamısı', count: messages.length },
              { value: 'unread', label: 'Oxunmamış', count: unread, accent: 'clay' },
              { value: 'read', label: 'Oxunmuş', count: messages.length - unread, accent: 'sage' },
            ]}
          />

          {visible.length === 0 ? (
            <EmptyState icon={Inbox} title="Mesaj yoxdur" text="Əlaqə formundan gələn yeni müraciətlər burada görünəcək." />
          ) : (
            <ul className="mt-6 divide-y divide-linen-200 border-y border-linen-200">
              {visible.map((message) => (
                <li key={message.id}>
                  <button
                    type="button"
                    onClick={() => setOpenId(message.id)}
                    className="flex w-full items-start gap-4 px-2 py-4 text-left transition-colors hover:bg-linen-100/60"
                  >
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${message.isRead ? 'bg-transparent' : 'bg-clay-500'}`} aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline justify-between gap-x-4">
                        <span className={`truncate text-sm ${message.isRead ? 'text-ink-700' : 'font-medium text-ink-900'}`}>
                          {message.name} <span className="font-normal text-ink-400">· {message.email}</span>
                        </span>
                        <span className="shrink-0 text-[11px] tabular-nums text-ink-400">{formatDateTime(message.createdAt)}</span>
                      </span>
                      <span className="mt-1 line-clamp-2 block text-[13px] leading-relaxed text-ink-500">{message.message}</span>
                    </span>
                    <span className="sr-only">{message.isRead ? 'Oxunub' : 'Oxunmayıb'}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <Drawer open={Boolean(open)} onClose={() => setOpenId(null)} label="Mesaj" widthClass="max-w-lg">
        {open && (
          <>
            <header className="flex items-start justify-between gap-4 border-b border-linen-200 px-6 py-5">
              <div className="min-w-0">
                <p className={microLabelClass}>Mesaj · {formatDateTime(open.createdAt)}</p>
                <h2 className="mt-1.5 truncate font-display text-2xl text-ink-900">{open.name}</h2>
                <a href={`mailto:${open.email}`} className="text-sm text-ink-500 underline-offset-4 hover:underline">
                  {open.email}
                </a>
              </div>
              <DrawerCloseButton onClick={() => setOpenId(null)} />
            </header>
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink-700">{open.message}</p>
            </div>
            <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-linen-200 bg-linen-100/40 px-6 py-4">
              <Button variant="ghost" onClick={() => setDeleting(open)} className="mr-auto hover:text-clay-600">
                <Trash2 size={13} strokeWidth={1.75} />
                Sil
              </Button>
              <Button
                onClick={() => {
                  // Closed first, so the "opened, so read" effect does not mark it read again.
                  setOpenId(null)
                  markUnread(open)
                }}
              >
                <Mail size={13} strokeWidth={1.75} />
                Oxunmamış et
              </Button>
              <a
                href={`mailto:${open.email}?subject=${encodeURIComponent('Khazar — müraciətiniz')}`}
                className="inline-flex h-10 items-center gap-2 border border-ink-900 bg-ink-900 px-5 text-[10px] font-medium uppercase tracking-[0.25em] text-linen-50 transition-colors hover:bg-ink-700"
              >
                <MailOpen size={13} strokeWidth={1.75} />
                Cavab yaz
              </a>
            </footer>
          </>
        )}
      </Drawer>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Mesaj silinsin?"
        confirmLabel="Sil"
        busy={deleteBusy}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      >
        {deleting?.name} ({deleting?.email}) göndərdiyi mesaj həmişəlik silinəcək.
      </ConfirmDialog>
    </div>
  )
}
