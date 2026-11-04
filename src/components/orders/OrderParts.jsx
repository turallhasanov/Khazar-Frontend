import { mediaUrl } from '../../services/api.js'
import { hideBrokenImage } from '../../services/imageFallback.js'
import { formatPrice } from '../../services/formatPrice'
import { orderStatusView, STATUS_TONE_CLASSES } from '../../services/orderStatus.js'

/** Colored status pill: green = Tamamlandı, yellow = Gözləmədə, red = Ləğv edildi. */
export function OrderStatusBadge({ status }) {
  const { label, tone } = orderStatusView(status)
  return (
    <span
      data-tone={tone}
      className={`inline-block whitespace-nowrap border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] ${STATUS_TONE_CLASSES[tone]}`}
    >
      {label}
    </span>
  )
}

/** One purchased line: photo, name, size/color, quantity × price. */
export function OrderLine({ item }) {
  const details = [item.color, item.size].filter((part) => part && part !== 'Standart').join(' / ')
  return (
    <li className="flex items-center gap-4 py-4">
      <div className="h-20 w-16 shrink-0 overflow-hidden bg-linen-100">
        {item.imageUrl && (
          <img src={mediaUrl(item.imageUrl)} alt={item.name} onError={hideBrokenImage} className="h-full w-full object-cover" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] text-ink-900">{item.name}</p>
        {details && <p className="mt-1 text-xs uppercase tracking-[0.12em] text-ink-500">{details}</p>}
        <p className="mt-1 text-sm text-ink-500">
          {item.quantity} × {formatPrice(item.unitPrice)}
        </p>
      </div>
      <p className="whitespace-nowrap text-[15px] text-ink-900">{formatPrice(item.lineTotal)}</p>
    </li>
  )
}
