import { ArrowLeft, Minus, Plus, ShoppingBag, Truck, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../services/formatPrice.js'
import { FREE_SHIPPING_THRESHOLD } from '../components/cart/CartDrawer'

const qtyButton =
  'flex h-8 w-8 items-center justify-center border border-ink-900/20 text-ink-700 transition-colors hover:border-ink-900 disabled:cursor-not-allowed disabled:opacity-30'

/**
 * Mikro-Aşama 10: Özel sepet sayfası (/sebet).
 * Editoryal estetik: bej zemin, satır satır ürün listesi + sağda özet paneli.
 */
export function CartPage() {
  const { items, totalItemsCount, subtotalPrice, discountAmount, updateQuantity, removeFromCart } =
    useCart()

  if (items.length === 0) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-24">
        <div className="flex flex-col items-center gap-4 text-center">
          <ShoppingBag size={32} strokeWidth={1} className="text-ink-300" />
          <p className="font-display text-3xl text-ink-900">Səbətiniz boşdur</p>
          <p className="max-w-xs text-sm leading-relaxed text-ink-400">
            Yeni kolleksiyamıza göz atın — minimal, keyfiyyətli hazır geyimlər.
          </p>
          <Link
            to="/katalog"
            className="mt-2 border border-ink-900 px-10 py-3.5 text-[11px] uppercase tracking-[0.3em] text-ink-900 transition-colors hover:bg-ink-900 hover:text-linen-50"
          >
            Kataloqa bax
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex items-baseline justify-between">
          <h1 className="font-display text-3xl text-ink-900">Səbət</h1>
          <span className="text-[11px] uppercase tracking-[0.25em] text-ink-400">
            {totalItemsCount} məhsul
          </span>
        </div>

        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_360px]">
          {/* Ürün listesi */}
          <ul className="divide-y divide-linen-200 border-t border-linen-200">
            {items.map((item) => (
              <li
                key={item.cartItemId}
                className="grid grid-cols-[96px_1fr] gap-6 py-6 sm:grid-cols-[120px_1fr_auto] sm:items-center"
              >
                <Link to={`/mehsul/${item.slug}`}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-32 w-24 bg-linen-100 object-cover sm:h-36 sm:w-30"
                  />
                </Link>

                <div className="flex flex-col gap-1.5">
                  <Link
                    to={`/mehsul/${item.slug}`}
                    className="text-sm font-medium tracking-wide text-ink-900 transition-colors hover:text-clay-600"
                  >
                    {item.name}
                  </Link>
                  <p className="text-xs text-ink-400">
                    {item.color.name} / {item.size}
                  </p>
                  {item.compareAtPrice && (
                    <p className="text-xs text-ink-400">
                      <span className="line-through">{formatPrice(item.compareAtPrice)}</span>{' '}
                      <span className="text-clay-600">{formatPrice(item.unitPrice)}</span>
                    </p>
                  )}
                  <div className="mt-2 flex items-center">
                    <button
                      type="button"
                      aria-label="Azalt"
                      className={qtyButton}
                      disabled={item.quantity <= 1}
                      onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                    >
                      <Minus size={12} strokeWidth={1.5} />
                    </button>
                    <span className="w-10 text-center text-sm tracking-widest">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label="Artır"
                      className={qtyButton}
                      onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                    >
                      <Plus size={12} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>

                <div className="col-start-2 flex flex-row items-center justify-between gap-4 sm:col-start-auto sm:flex-col sm:items-end sm:justify-between">
                  <p className="text-sm font-medium text-ink-900">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </p>
                  <button
                    type="button"
                    aria-label={`${item.name} sil`}
                    onClick={() => removeFromCart(item.cartItemId)}
                    className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-ink-400 transition-colors hover:text-clay-600"
                  >
                    <X size={13} strokeWidth={1.5} />
                    Sil
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {/* Özet paneli */}
          <aside className="h-fit border border-linen-200 bg-linen-100/60 p-7">
            <h2 className="text-[11px] font-medium uppercase tracking-[0.3em] text-ink-900">
              Sifariş xülasəsi
            </h2>

            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-500">Ara toplam</dt>
                <dd className="text-ink-900">{formatPrice(subtotalPrice + discountAmount)}</dd>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-ink-500">Endirim</dt>
                  <dd className="text-sage-600">−{formatPrice(discountAmount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-ink-500">Çatdırılma</dt>
                <dd className="text-ink-900">
                  {subtotalPrice >= FREE_SHIPPING_THRESHOLD ? 'Pulsuz' : 'Ödənişdə hesablanır'}
                </dd>
              </div>
              <div className="flex justify-between border-t border-linen-200 pt-4">
                <dt className="text-[11px] uppercase tracking-[0.25em] text-ink-900">Cəmi</dt>
                <dd className="font-display text-xl text-ink-900">{formatPrice(subtotalPrice)}</dd>
              </div>
            </dl>

            <p className="mt-4 flex items-center gap-2 text-[11px] tracking-wide text-ink-500">
              <Truck size={14} strokeWidth={1.5} />
              {subtotalPrice >= FREE_SHIPPING_THRESHOLD ? (
                <span className="text-sage-600">Pulsuz çatdırılma qazandınız</span>
              ) : (
                <span>
                  {formatPrice(FREE_SHIPPING_THRESHOLD - subtotalPrice)} daha əlavə etsəniz pulsuz
                  çatdırılma qazanacaqsınız
                </span>
              )}
            </p>

            {/* /odeme rotası Mikro-Aşama 11 (Checkout) ile eklenecek */}
            <Link
              to="/odeme"
              className="mt-6 block bg-ink-900 py-4 text-center text-[11px] font-medium uppercase tracking-[0.35em] text-linen-50 transition-colors hover:bg-clay-600"
            >
              Ödənişə keç
            </Link>

            <Link
              to="/katalog"
              className="mt-4 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.25em] text-ink-500 underline-offset-4 transition-colors hover:text-ink-900 hover:underline"
            >
              <ArrowLeft size={13} strokeWidth={1.5} />
              Alış-verişə davam et
            </Link>
          </aside>
        </div>
      </div>
    </main>
  )
}
