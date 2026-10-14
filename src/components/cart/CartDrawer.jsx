import { Minus, Plus, ShoppingBag, Truck, X } from 'lucide-react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { formatPrice } from '../../services/formatPrice'

/** 150 ₼ üzəri sifarişlərdə çatdırılma pulsuzdur (FeatureBand ilə eyni şərt). */
export const FREE_SHIPPING_THRESHOLD = 150

const qtyButton =
  'flex h-7 w-7 items-center justify-center border border-ink-900/20 text-ink-700 transition-colors hover:border-ink-900 disabled:cursor-not-allowed disabled:opacity-30'

/**
 * Mikro-Aşama 10: Sağdan kayan sepet paneli (slide-over).
 * Header sepet simgesi veya "Səbətə əlavə et" ile açılır.
 */
export function CartDrawer() {
  const {
    items,
    totalItemsCount,
    subtotalPrice,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
  } = useCart()

  // Panel açıkken arka plan kaydırmasını kilitle
  useEffect(() => {
    if (!isCartOpen) return undefined
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [isCartOpen])

  const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - subtotalPrice
  const progress = Math.min(subtotalPrice / FREE_SHIPPING_THRESHOLD, 1)

  return (
    <div
      className={`fixed inset-0 z-50 ${isCartOpen ? '' : 'pointer-events-none'}`}
      aria-hidden={!isCartOpen}
    >
      {/* Karartma perdesi */}
      <button
        type="button"
        aria-label="Səbəti bağla"
        tabIndex={isCartOpen ? 0 : -1}
        onClick={closeCart}
        className={`absolute inset-0 bg-ink-900/40 transition-opacity duration-300 ${
          isCartOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />
      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Səbət"
        className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-linen-50 shadow-2xl transition-transform duration-300 ease-out ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-linen-200 px-6 py-4">
          <span className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.3em] text-ink-900">
            <ShoppingBag size={16} strokeWidth={1.5} />
            Səbət — {totalItemsCount}
          </span>
          <button
            type="button"
            aria-label="Bağla"
            onClick={closeCart}
            className="p-1 text-ink-500 transition-colors hover:text-ink-900"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="font-display text-2xl text-ink-700">Səbətiniz boşdur</p>
            <p className="text-sm text-ink-400">
              Yeni kolleksiyaya göz atın.
            </p>
            <Link
              to="/katalog"
              onClick={closeCart}
              className="mt-2 border border-ink-900 px-8 py-3 text-[11px] uppercase tracking-[0.3em] text-ink-900 transition-colors hover:bg-ink-900 hover:text-linen-50"
            >
              Kataloqa bax
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <ul className="divide-y divide-linen-200">
                {items.map((item) => (
                  <li key={item.cartItemId} className="flex gap-4 py-4">
                    <Link to={`/mehsul/${item.slug}`} onClick={closeCart}>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-24 w-20 object-cover"
                      />
                    </Link>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to={`/mehsul/${item.slug}`}
                          onClick={closeCart}
                          className="text-sm font-medium tracking-wide text-ink-900 transition-colors hover:text-clay-600"
                        >
                          {item.name}
                        </Link>
                        <button
                          type="button"
                          aria-label={`${item.name} sil`}
                          onClick={() => removeFromCart(item.cartItemId)}
                          className="p-0.5 text-ink-400 transition-colors hover:text-clay-600"
                        >
                          <X size={14} strokeWidth={1.5} />
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-ink-400">
                        {item.color.name} / {item.size}
                      </p>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="flex items-center">
                          <button
                            type="button"
                            aria-label="Azalt"
                            className={qtyButton}
                            disabled={item.quantity <= 1}
                            onClick={() =>
                              updateQuantity(item.cartItemId, item.quantity - 1)
                            }
                          >
                            <Minus size={12} strokeWidth={1.5} />
                          </button>
                          <span className="w-9 text-center text-xs tracking-widest">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label="Artır"
                            className={qtyButton}
                            onClick={() =>
                              updateQuantity(item.cartItemId, item.quantity + 1)
                            }
                          >
                            <Plus size={12} strokeWidth={1.5} />
                          </button>
                        </div>
                        <p className="text-sm text-ink-900">
                          {formatPrice(item.unitPrice * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-linen-200 px-6 py-5">
              {/* Pulsuz çatdırılma durumu */}
              <div className="mb-4">
                <p className="flex items-center gap-2 text-[11px] tracking-wide text-ink-500">
                  <Truck size={14} strokeWidth={1.5} />
                  {remainingForFreeShipping > 0 ? (
                    <span>
                      Pulsuz çatdırılmaya{' '}
                      <span className="text-ink-900">{formatPrice(remainingForFreeShipping)}</span>{' '}
                      qaldı
                    </span>
                  ) : (
                    <span className="text-sage-600">Pulsuz çatdırılma qazandınız</span>
                  )}
                </p>
                <div className="mt-2 h-1 w-full bg-linen-200">
                  <div
                    className={`h-full transition-all duration-500 ${remainingForFreeShipping > 0 ? 'bg-clay-500' : 'bg-sage-600'}`}
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-[11px] uppercase tracking-[0.3em] text-ink-500">
                  Ara toplam
                </span>
                <span className="font-display text-xl text-ink-900">
                  {formatPrice(subtotalPrice)}
                </span>
              </div>
              <Link
                to="/sebet"
                onClick={closeCart}
                className="mt-4 block bg-ink-900 py-4 text-center text-[11px] font-medium uppercase tracking-[0.35em] text-linen-50 transition-colors hover:bg-clay-600"
              >
                Sifarişi tamamla
              </Link>
              <button
                type="button"
                onClick={closeCart}
                className="mt-3 w-full text-center text-[10px] uppercase tracking-[0.25em] text-ink-500 underline-offset-4 transition-colors hover:text-ink-900 hover:underline"
              >
                Alış-verişə davam et
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
