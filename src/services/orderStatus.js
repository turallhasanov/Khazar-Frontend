/**
 * How a customer sees an order's state (Khazar.Domain OrderStatus). Green = completed, yellow = in progress,
 * red = cancelled. Processing and SyncedToErp are in-progress states, so they stay yellow but say more.
 */
const STATUS_VIEW = {
  Pending: { label: 'Gözləmədə', tone: 'yellow' },
  Processing: { label: 'Hazırlanır', tone: 'yellow' },
  SyncedToErp: { label: 'Təsdiqləndi', tone: 'yellow' },
  Completed: { label: 'Tamamlandı', tone: 'green' },
  Cancelled: { label: 'Ləğv edildi', tone: 'red' },
}

export const STATUS_TONE_CLASSES = {
  green: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  yellow: 'border-amber-200 bg-amber-50 text-amber-800',
  red: 'border-red-200 bg-red-50 text-red-800',
}

/** Unknown states (a newer API) fall back to a yellow pill showing the raw value. */
export function orderStatusView(status) {
  return STATUS_VIEW[status] ?? { label: status || '—', tone: 'yellow' }
}

const dateFormat = new Intl.DateTimeFormat('az-AZ', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

/** The API sends UTC timestamps that may lack a zone suffix; read them as UTC. */
export function formatOrderDate(value) {
  if (!value) return ''
  const utc = /[zZ]|[+-]\d{2}:?\d{2}$/.test(value) ? value : `${value}Z`
  return dateFormat.format(new Date(utc))
}
