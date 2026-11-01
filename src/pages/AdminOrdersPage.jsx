import { AlertCircle, CheckCircle2, RefreshCw, RotateCw, ShoppingBag, Trash2, XCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useAdminToast } from '../components/admin/AdminToasts.jsx'
import {
  AdminPageHeader,
  Button,
  ConfirmDialog,
  Drawer,
  DrawerCloseButton,
  EmptyState,
  FilterField,
  Select,
  StaleNotice,
  TextInput,
  ToneBadge,
  microLabelClass,
} from '../components/admin/adminUi.jsx'
import { ListSkeleton } from '../components/admin/reviews/ReviewsList.jsx'
import { formatDateTime, formatTime, useAdminList } from '../components/admin/useAdminList.js'
import {
  cancelOrder,
  completeOrder,
  deleteOrder,
  getAdminOrders,
  getCancelledOrders,
  syncOrderToNexus,
} from '../services/adminService.js'
import { ApiError } from '../services/api.js'
import { formatPrice } from '../services/formatPrice'

/** Order states (Khazar.Domain OrderStatus) as the admin sees them. */
const ORDER_STATUS = {
  Pending: { label: 'Gözləyir', tone: 'clay', hint: 'NexusERP-ə hələ ötürülməyib.' },
  Processing: { label: 'Emal olunur', tone: 'ink', hint: 'NexusERP-ə ötürülür.' },
  SyncedToErp: { label: 'NexusERP-də', tone: 'ink', hint: 'NexusERP qəbul edib; təhvildən sonra tamamlayın.' },
  Completed: { label: 'Tamamlanıb', tone: 'sage', hint: 'Təhvil verilib.' },
  Cancelled: { label: 'Ləğv edildi', tone: 'muted', hint: 'Məhsullar stoka qaytarılıb.' },
}

const describeOrderError = (error) => {
  if (!(error instanceof ApiError)) return 'Gözlənilməz xəta baş verdi.'
  if (error.status === 0) return 'Serverə qoşulmaq mümkün olmadı.'
  if (error.code === 'invalid_order_status') return 'Sifarişin statusu bu əməliyyata imkan vermir — siyahını yeniləyin.'
  // error.message is the API's detail: NexusERP's HTTP status and its own reason (unknown SKU, no company, login failed ...).
  if (error.code === 'nexus_sync_failed') return `NexusERP sifarişi qəbul etmədi. ${error.message}`
  if (error.status === 404 && error.code === 'not_found') return 'Sifariş tapılmadı.'
  // A 404 without the API's own error code means the route does not exist: the API is an older build.
  if (error.status === 404) return 'Əməliyyat serverdə tapılmadı — Khazar API-ni yenidən başladın.'
  return error.message
}

/**
 * /admin/sifarisler — orders from GET /api/admin/orders: search, filter by status, details, and the status actions
 * the order allows (complete, cancel with stock return, retry the NexusERP push). "Sil" cancels an order, which moves
 * it out of the default list into the "Ləğv edilmişlər" filter; orders are never erased.
 */
export function AdminOrdersPage() {
  const { toast } = useAdminToast()
  const list = useAdminList(getAdminOrders)
  const cancelledList = useAdminList(getCancelledOrders)
  const [status, setStatus] = useState('')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [busy, setBusy] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const [deleting, setDeleting] = useState(null)

  // The default view lists active orders only; cancelled ones are loaded separately and shown by the status filter.
  const orders = list.items
  const cancelledOrders = cancelledList.items
  const showCancelled = status === 'Cancelled'
  const selected = [...orders, ...cancelledOrders].find((order) => order.id === selectedId) ?? null
  const counts = useMemo(
    () => Object.fromEntries(Object.keys(ORDER_STATUS).map((key) => [key, orders.filter((order) => order.status === key).length])),
    [orders],
  )
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return (showCancelled ? cancelledOrders : orders).filter(
      (order) =>
        (!status || showCancelled || order.status === status) &&
        (!needle || [order.orderNumber, order.customerName, order.customerEmail].join(' ').toLowerCase().includes(needle)),
    )
  }, [orders, cancelledOrders, showCancelled, status, query])

  const run = async (action, order, success) => {
    setBusy(action)
    try {
      const request = { complete: completeOrder, cancel: cancelOrder, delete: deleteOrder, sync: syncOrderToNexus }[action]
      const updated = await request(order.id)
      if (updated.status === 'Cancelled') {
        // A cancelled order leaves the active list and joins the cancelled one.
        list.setItems((items) => items.filter((item) => item.id !== updated.id))
        cancelledList.setItems((items) => [updated, ...items.filter((item) => item.id !== updated.id)])
        setSelectedId((current) => (current === updated.id ? null : current))
      } else {
        list.setItems((items) => items.map((item) => (item.id === updated.id ? updated : item)))
      }
      toast({ message: success })
    } catch (error) {
      toast({ message: describeOrderError(error), tone: 'error' })
    } finally {
      setBusy(null)
      setCancelling(false)
      setDeleting(null)
    }
  }

  const ready = list.status === 'ready'

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        eyebrow="Satış"
        title="Sifarişlər"
        description="Saytdan verilən aktiv sifarişlər. Silinən və ya ləğv edilən sifarişlər siyahıdan çıxır, məhsullar stoka qaytarılır; onlara «Ləğv edilmişlər» filtri ilə baxa bilərsiniz."
        actions={
          <>
            {list.loadedAt && <span className="text-[11px] text-ink-400">Yeniləndi · {formatTime(list.loadedAt)}</span>}
            <Button size="sm" onClick={list.reload} disabled={list.refreshing || list.status === 'loading'}>
              <RefreshCw size={13} strokeWidth={1.75} className={list.refreshing ? 'animate-spin' : ''} />
              Yenilə
            </Button>
          </>
        }
      />

      {ready && list.error && <StaleNotice />}
      {list.status === 'loading' && <ListSkeleton />}
      {list.status === 'error' && (
        <EmptyState
          icon={AlertCircle}
          title={list.error instanceof ApiError && list.error.status === 403 ? 'Admin icazəniz yoxdur' : 'Sifarişlər yüklənmədi'}
          text="Bir az sonra yenidən cəhd edin."
          action={<Button onClick={list.reload}>Yenidən cəhd et</Button>}
        />
      )}

      {ready && orders.length === 0 && cancelledOrders.length === 0 && (
        <EmptyState icon={ShoppingBag} title="Hələ sifariş yoxdur" text="Saytdan verilən sifarişlər burada görünəcək." />
      )}

      {ready && (orders.length > 0 || cancelledOrders.length > 0) && (
        <>
          <div className="mt-8 grid gap-3 sm:grid-cols-[minmax(0,1fr)_14rem]">
            <FilterField label="Axtarış">
              <TextInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder="KHZ-…, ad və ya e-poçt" />
            </FilterField>
            <FilterField label="Status">
              <Select value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="">Aktiv sifarişlər ({orders.length})</option>
                {Object.entries(ORDER_STATUS)
                  .filter(([key]) => key !== 'Cancelled')
                  .map(([key, meta]) => (
                    <option key={key} value={key}>
                      {meta.label} ({counts[key]})
                    </option>
                  ))}
                <option value="Cancelled">Ləğv edilmişlər ({cancelledOrders.length})</option>
              </Select>
            </FilterField>
          </div>

          <p className="mt-6 text-[11px] tabular-nums text-ink-500">
            {visible.length} sifariş · {formatPrice(visible.reduce((sum, order) => sum + order.totalAmount, 0))} (çatdırılmasız)
          </p>

          {visible.length === 0 ? (
            <p className="mt-6 text-sm text-ink-500">Filtrə uyğun sifariş yoxdur.</p>
          ) : (
            <ul className="mt-3 divide-y divide-linen-200 border-y border-linen-200">
              {visible.map((order) => (
                <li key={order.id} className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setSelectedId(order.id)}
                    className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-2 py-3.5 text-left transition-colors hover:bg-linen-100/60 sm:grid-cols-[10rem_minmax(0,1fr)_7rem_9rem]"
                  >
                    <span>
                      <span className="block font-mono text-[13px] text-ink-900">{order.orderNumber}</span>
                      <span className="block text-[11px] text-ink-400">{formatDateTime(order.createdAt)}</span>
                    </span>
                    <span className="hidden min-w-0 sm:block">
                      <span className="block truncate text-sm text-ink-900">{order.customerName}</span>
                      <span className="block truncate text-[11px] text-ink-400">{order.customerEmail}</span>
                    </span>
                    <span className="text-right text-sm tabular-nums text-ink-900 sm:text-left">{formatPrice(order.totalAmount)}</span>
                    <span className="col-span-2 sm:col-span-1">
                      <ToneBadge tone={ORDER_STATUS[order.status]?.tone}>{ORDER_STATUS[order.status]?.label ?? order.status}</ToneBadge>
                    </span>
                  </button>
                  {!['Completed', 'Cancelled'].includes(order.status) && (
                    <button
                      type="button"
                      aria-label={`${order.orderNumber} sil`}
                      title="Sil"
                      onClick={() => setDeleting(order)}
                      disabled={Boolean(busy)}
                      className="mx-2 shrink-0 rounded p-2 text-ink-400 transition-colors hover:bg-linen-100 hover:text-red-700 disabled:opacity-50"
                    >
                      <Trash2 size={15} strokeWidth={1.75} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <Drawer open={Boolean(selected)} onClose={() => setSelectedId(null)} label="Sifariş" widthClass="max-w-xl">
        {selected && (
          <>
            <header className="flex items-start justify-between gap-4 border-b border-linen-200 px-6 py-5">
              <div className="min-w-0">
                <p className={microLabelClass}>Sifariş · {formatDateTime(selected.createdAt)}</p>
                <h2 className="mt-1.5 font-mono text-2xl text-ink-900">{selected.orderNumber}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <ToneBadge tone={ORDER_STATUS[selected.status]?.tone}>{ORDER_STATUS[selected.status]?.label}</ToneBadge>
                  <span className="text-[11px] text-ink-400">{ORDER_STATUS[selected.status]?.hint}</span>
                </div>
              </div>
              <DrawerCloseButton onClick={() => setSelectedId(null)} />
            </header>

            <div className="flex-1 space-y-7 overflow-y-auto px-6 py-6">
              <section>
                <p className={microLabelClass}>Müştəri</p>
                <p className="mt-2 text-sm text-ink-900">{selected.customerName}</p>
                <a href={`mailto:${selected.customerEmail}`} className="text-sm text-ink-500 underline-offset-4 hover:underline">
                  {selected.customerEmail}
                </a>
                <p className="mt-1 text-[11px] text-ink-400">{selected.userId ? 'Qeydiyyatlı hesab' : 'Qonaq sifarişi'}</p>
              </section>

              <section>
                <p className={microLabelClass}>Çatdırılma ünvanı</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-700">{selected.shippingAddress}</p>
              </section>

              <section>
                <p className={microLabelClass}>Məhsullar · {selected.itemCount} ədəd</p>
                <ul className="mt-2 divide-y divide-linen-200 border-y border-linen-200">
                  {selected.items.map((item) => (
                    <li key={item.id} className="flex items-baseline justify-between gap-4 py-3">
                      <span className="min-w-0">
                        <span className="block truncate text-sm text-ink-900">{item.name}</span>
                        <span className="block text-[11px] text-ink-400">
                          {item.color} · {item.size} · {formatPrice(item.unitPrice)} × {item.quantity}
                        </span>
                      </span>
                      <span className="shrink-0 text-sm tabular-nums text-ink-900">{formatPrice(item.lineTotal)}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 flex justify-between text-sm">
                  <span className="text-ink-500">Məhsulların cəmi</span>
                  <span className="tabular-nums text-ink-900">{formatPrice(selected.totalAmount)}</span>
                </p>
                <p className="mt-1 text-[11px] text-ink-400">Çatdırılma haqqı sifarişdə saxlanmır; müştəriyə göstərilən cəm ona əlavə olunub.</p>
              </section>
            </div>

            <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-linen-200 bg-linen-100/40 px-6 py-4">
              {selected.status === 'Pending' && (
                <Button
                  onClick={() => run('sync', selected, `${selected.orderNumber} NexusERP-ə ötürüldü.`)}
                  disabled={Boolean(busy)}
                >
                  <RotateCw size={13} strokeWidth={1.75} className={busy === 'sync' ? 'animate-spin' : ''} />
                  {busy === 'sync' ? 'Ötürülür…' : 'NexusERP-ə Ötür'}
                </Button>
              )}
              {!['Completed', 'Cancelled'].includes(selected.status) && (
                <Button variant="reject" onClick={() => setCancelling(true)} disabled={Boolean(busy)}>
                  <XCircle size={13} strokeWidth={1.75} />
                  Ləğv et
                </Button>
              )}
              {selected.status === 'SyncedToErp' && (
                <Button variant="approve" onClick={() => run('complete', selected, `${selected.orderNumber} tamamlandı.`)} disabled={Boolean(busy)}>
                  <CheckCircle2 size={13} strokeWidth={1.75} />
                  {busy === 'complete' ? 'Gözləyin…' : 'Tamamlandı'}
                </Button>
              )}
            </footer>
          </>
        )}
      </Drawer>

      <ConfirmDialog
        open={cancelling && Boolean(selected)}
        title={`${selected?.orderNumber} ləğv edilsin?`}
        confirmLabel="Sifarişi ləğv et"
        busy={busy === 'cancel'}
        onCancel={() => setCancelling(false)}
        onConfirm={() => run('cancel', selected, `${selected.orderNumber} ləğv edildi, məhsullar stoka qaytarıldı.`)}
      >
        Məhsullar ({selected?.itemCount} ədəd) stoka qaytarılacaq. Geri qaytarıla bilməz.
        {selected?.status === 'SyncedToErp' && ' Sifariş NexusERP-də də ləğv ediləcək.'}
      </ConfirmDialog>

      <ConfirmDialog
        open={Boolean(deleting)}
        title={`${deleting?.orderNumber} silinsin?`}
        confirmLabel="Sifarişi sil"
        busy={busy === 'delete'}
        onCancel={() => setDeleting(null)}
        onConfirm={() => run('delete', deleting, `${deleting.orderNumber} silindi, məhsullar stoka qaytarıldı.`)}
      >
        Sifariş ləğv ediləcək və siyahıdan çıxacaq; məhsullar ({deleting?.itemCount} ədəd) stoka qaytarılacaq.
        {deleting?.status === 'SyncedToErp' && ' Sifariş NexusERP-də də ləğv ediləcək.'} Ona «Ləğv edilmişlər» filtri ilə baxa
        bilərsiniz.
      </ConfirmDialog>
    </div>
  )
}
