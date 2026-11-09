import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatPrice } from '../../services/formatPrice.js'

const primaryLinkClass =
  'border border-ink-900 px-10 py-3.5 text-[11px] uppercase tracking-[0.3em] text-ink-900 transition-colors hover:bg-ink-900 hover:text-linen-50'

/**
 * Sifariş təsdiq ekranı. `signedIn` — sifariş hesaba bağlıdırsa "Sifarişlərim" düyməsi göstərilir (qonaq sifarişi
 * hesaba bağlı deyil).
 */
export function OrderConfirmation({ order, signedIn = false }) {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="flex w-full max-w-lg flex-col items-center gap-5 border border-linen-200 bg-linen-100/60 px-8 py-14 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sage-600 text-linen-50">
          <Check size={26} strokeWidth={1.5} />
        </span>
        <h1 className="font-display text-3xl text-ink-900">Sifarişiniz qəbul edildi</h1>
        <p className="text-sm leading-relaxed text-ink-500">
          {order.name} — sifariş nömrəniz <span className="font-medium text-ink-900">{order.number}</span>. {order.city}{' '}
          üzrə {order.payment.toLowerCase()} ilə ödəniləcək. Təsdiq e-poçtunuz göndərildi.
        </p>
        <dl className="mt-2 w-full space-y-2 border-t border-linen-200 pt-5 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-500">Məhsul sayı</dt>
            <dd className="text-ink-900">{order.itemCount}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-500">Yekun məbləğ</dt>
            <dd className="font-display text-lg text-ink-900">{formatPrice(order.total)}</dd>
          </div>
        </dl>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          {signedIn ? (
            <Link to="/sifarislerim" className={primaryLinkClass}>
              Sifarişlərim
            </Link>
          ) : null}
          <Link to="/katalog" className={primaryLinkClass}>
            Kataloqa qayıt
          </Link>
        </div>
      </div>
    </main>
  )
}
