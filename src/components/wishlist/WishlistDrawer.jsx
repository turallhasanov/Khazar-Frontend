import { Heart, ShoppingBag, X } from 'lucide-react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import { formatPrice } from '../../services/formatPrice'

/** Ürünün stokta olan ilk ölçüsünü döndürür (yoksa null). */
function firstInStockSize(product) {
  return product.sizes.find((size) => (product.stock[size] ?? 0) > 0) ?? null
}

/**
 * İstək Siyahısı paneli — sağdan kayan minimalist editoryal drawer.
 * Ürün kartı / detay sayfası kalbi veya header sayacı ile açılır.
 */
export function WishlistDrawer() {
  const { items, count, isOpen, closeWishlist, toggleWishlist } = useWishlist()
  const { addToCart, openCart } = useCart()

  // Panel açıkken arka plan kaydırmasını kilitle
  useEffect(() => {
    if (!isOpen) return undefined
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [isOpen])

  const quickAdd = (product) => {
    const size = firstInStockSize(product)
    if (!size) return
    addToCart(product, product.colors[0], size)
    closeWishlist()
    openCart()
  }

  return (
    <div
      className={`fixed inset-0 z-50 ${isOpen ? '' : 'pointer-events-none'}`}
      aria-hidden={!isOpen}
    >
      {/* Karartma perdesi */}
      <button
        type="button"
        aria-label="İstək siyahısını bağla"
        tabIndex={isOpen ? 0 : -1}
        onClick={closeWishlist}
        className={`absolute inset-0 bg-ink-900/40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />
      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="İstək siyahısı"
        className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-linen-50 transition-[transform,visibility,box-shadow] duration-500 ease-[var(--ease-editorial)] ${
          isOpen ? 'visible translate-x-0 shadow-2xl shadow-ink-900/15' : 'invisible translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-linen-200 px-6 py-4">
          <span className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.3em] text-ink-900">
            <Heart size={16} strokeWidth={1.5} />
            İstək siyahısı — {count}
          </span>
          <button
            type="button"
            aria-label="Bağla"
            onClick={closeWishlist}
            className="p-1 text-ink-500 transition-colors hover:text-ink-900"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="font-display text-2xl text-ink-700">Siyahınız boşdur</p>
            <p className="text-sm text-ink-400">
              Bəyəndiyiniz parçaları ürək ikonu ilə saxlayın.
            </p>
            <Link
              to="/katalog"
              onClick={closeWishlist}
              className="mt-2 border border-ink-900 px-8 py-3 text-[11px] uppercase tracking-[0.3em] text-ink-900 transition-colors hover:bg-ink-900 hover:text-linen-50"
            >
              Kataloqa bax
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <ul className="divide-y divide-linen-200">
                {items.map((product) => (
                  <li key={product.id} className="flex gap-4 py-4">
                    <Link to={`/mehsul/${product.slug}`} onClick={closeWishlist}>
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-24 w-20 object-cover"
                      />
                    </Link>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to={`/mehsul/${product.slug}`}
                          onClick={closeWishlist}
                          className="text-sm font-medium tracking-wide text-ink-900 transition-colors hover:text-clay-600"
                        >
                          {product.name}
                        </Link>
                        <button
                          type="button"
                          aria-label={`${product.name} siyahıdan sil`}
                          onClick={() => toggleWishlist(product.id)}
                          className="p-0.5 text-ink-400 transition-colors hover:text-clay-600"
                        >
                          <X size={14} strokeWidth={1.5} />
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-ink-400">
                        {product.category} · {product.fabric.material}
                      </p>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <span className="text-sm text-ink-900">
                          {formatPrice(product.basePrice)}
                        </span>
                        <button
                          type="button"
                          onClick={() => quickAdd(product)}
                          className="flex items-center gap-1.5 border border-ink-900/25 px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.2em] text-ink-700 transition-colors hover:border-ink-900 hover:bg-ink-900 hover:text-linen-50"
                        >
                          <ShoppingBag size={12} strokeWidth={1.5} />
                          Səbətə əlavə et
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-linen-200 px-6 py-5">
              <Link
                to="/katalog"
                onClick={closeWishlist}
                className="block bg-ink-900 py-4 text-center text-[11px] font-medium uppercase tracking-[0.35em] text-linen-50 transition-colors hover:bg-clay-600"
              >
                Alış-verişə davam et
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
