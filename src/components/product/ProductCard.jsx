import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { formatPrice } from '../../services/formatPrice.js'
import { ColorSwatches, WishlistButton } from './ProductControls.jsx'
import { discountPercent as getDiscountPercent, sizeInStock, totalStock, unsplashSrcSet } from './productDisplay.js'

const MAX_SWATCHES = 4

// One card per row on phones, two from md, three from lg (capped by the 7xl container).
const CARD_SIZES = '(min-width: 1280px) 400px, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw'

// Image motion: slow, controlled zoom; the second image rises in behind a curtain.
const IMAGE_MOTION = 'transition-[transform,opacity,clip-path] duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)]'

// Revealed on hover (fine pointers only, via Tailwind's hover media query) and on keyboard focus inside the card.
const REVEAL_ON_ACTIVE =
  'group-hover/card:translate-y-0 group-hover/card:opacity-100 group-focus-within/card:translate-y-0 group-focus-within/card:opacity-100'

/**
 * Editoryal katalog kartı.
 * - Görsel: 3/4 kadraj, yüklənərkən sakit skelet, xəta olanda boş krem qutu yerinə marka yer tutucusu
 * - Hover (yalnız siçan ilə): görsel 1.05-ə yavaş zoom, ikinci görsel alttan pərdə ilə açılır,
 *   aşağıda ölçü seçicisi qalxır — ölçüyə klik seçilmiş rənglə səbətə əlavə edir
 * - Kart: kölgəsiz, hover-da bir az qalxır; ad hover-də terracotta olur
 * - İstək siyahısı: krem dairəvi düymə, əlavə edəndə qısa "pop" və incə halqa
 * - Bilgi: serif ad, altında fiyat, ən altda material və seçilə bilən rəng nöqtələri
 */
export function ProductCard({ product, index = 0 }) {
  const { addToCart, openCart } = useCart()
  const [colorIndex, setColorIndex] = useState(0)
  const selectedColor = product.colors[colorIndex] ?? product.colors[0]

  const [primaryImage, secondaryImage] = product.images
  const primaryRef = useRef(null)
  const [primaryState, setPrimaryState] = useState('loading') // loading | loaded | error
  const [secondaryFailed, setSecondaryFailed] = useState(false)
  const hasSecondary = primaryState === 'loaded' && Boolean(secondaryImage) && !secondaryFailed

  // A cached image can finish before React attaches onLoad; read its state once after mount.
  useEffect(() => {
    const img = primaryRef.current
    if (img?.complete) setPrimaryState(img.naturalWidth > 0 ? 'loaded' : 'error')
  }, [])

  const stockTotal = totalStock(product.stock)
  const soldOut = stockTotal === 0
  const discountPercent = getDiscountPercent(product)
  const detailPath = `/mehsul/${product.slug}`
  const material = product.fabric.material
  // Quick add needs a color for the cart line; without one the sizes stay informational.
  const canQuickAdd = Boolean(selectedColor)

  const onQuickAdd = (size) => {
    addToCart(product, selectedColor, size)
    openCart()
  }

  return (
    <article
      className="animate-fade-up"
      // Short stagger on first paint; capped so long grids don't wait.
      style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
    >
      <div className="group/card h-full transition-transform duration-[600ms] ease-[var(--ease-editorial)] hover:-translate-y-1.5">
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-linen-100">
          <Link
            to={detailPath}
            aria-label={product.name}
            className="absolute inset-0 block outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-clay-600"
          >
            {primaryState === 'loading' && (
              <span aria-hidden="true" className="absolute inset-0 animate-pulse bg-linen-200/60" />
            )}

            {primaryState === 'error' ? (
              <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-linen-100 text-ink-400">
                <span className="font-display text-2xl tracking-[0.06em] text-ink-400">Khazar</span>
                <span className="text-[10px] uppercase tracking-[0.16em] text-ink-500">Şəkil yüklənmədi</span>
              </span>
            ) : (
              <img
                ref={primaryRef}
                src={primaryImage}
                srcSet={unsplashSrcSet(primaryImage)}
                sizes={CARD_SIZES}
                alt={product.name}
                loading="lazy"
                decoding="async"
                draggable={false}
                onLoad={() => setPrimaryState('loaded')}
                onError={() => setPrimaryState('error')}
                className={`absolute inset-0 h-full w-full object-cover ${IMAGE_MOTION} group-hover/card:scale-[1.05] ${
                  primaryState === 'loaded' ? 'opacity-100' : 'opacity-0'
                }`}
              />
            )}

            {hasSecondary && (
              <img
                src={secondaryImage}
                srcSet={unsplashSrcSet(secondaryImage)}
                sizes={CARD_SIZES}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                draggable={false}
                onError={() => setSecondaryFailed(true)}
                className={`absolute inset-0 h-full w-full scale-[1.1] object-cover [clip-path:inset(100%_0_0_0)] ${IMAGE_MOTION} duration-[800ms] group-hover/card:scale-[1.05] group-hover/card:[clip-path:inset(0_0_0_0)]`}
              />
            )}
          </Link>

          {/* Ölçü seçicisi — hover və ya klaviatura fokusunda alttan qalxır; tükənən ölçü söndürülür */}
          {product.sizes.length > 0 && !soldOut && (
            <div
              className={`pointer-events-none absolute inset-x-3 bottom-3 z-10 translate-y-3 bg-linen-50/95 px-2 pb-1.5 pt-2.5 opacity-0 backdrop-blur-sm transition duration-500 ease-[var(--ease-editorial)] group-hover/card:pointer-events-auto group-focus-within/card:pointer-events-auto ${REVEAL_ON_ACTIVE}`}
            >
              <p className="text-center text-[10px] uppercase tracking-[0.16em] text-ink-500">
                {canQuickAdd ? 'Ölçü seç · səbətə at' : 'Mövcud ölçülər'}
              </p>
              <ul className="mt-0.5 flex flex-wrap justify-center">
                {product.sizes.map((size, sizeIndex) => {
                  const inStock = sizeInStock(product, size)
                  const sizeClass = `relative flex h-9 min-w-9 translate-y-1 items-center justify-center px-2 text-[11px] font-medium uppercase tracking-[0.12em] opacity-0 transition duration-500 ease-[var(--ease-editorial)] ${REVEAL_ON_ACTIVE} ${
                    inStock ? 'text-ink-900' : 'text-ink-400 line-through'
                  }`
                  // Sizes follow the panel in a short cascade.
                  const cascade = { transitionDelay: `${80 + sizeIndex * 35}ms` }
                  return (
                    <li key={size}>
                      {canQuickAdd ? (
                        <button
                          type="button"
                          disabled={!inStock}
                          onClick={() => onQuickAdd(size)}
                          aria-label={`${product.name}, ${selectedColor.name}, ${size} — səbətə əlavə et`}
                          style={cascade}
                          className={`${sizeClass} after:absolute after:inset-x-2 after:bottom-1.5 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:text-clay-600 hover:after:scale-x-100 disabled:cursor-not-allowed disabled:after:hidden`}
                        >
                          {size}
                        </button>
                      ) : (
                        <span style={cascade} className={sizeClass}>
                          {size}
                        </span>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {/* Etiketlər — yalnız API-nin verdiyi real məlumat */}
          <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1">
            {soldOut ? (
              <span className="bg-ink-900 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-linen-50">
                Tükənib
              </span>
            ) : (
              <>
                {discountPercent > 0 && (
                  <span className="bg-clay-600 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-linen-50">
                    −{discountPercent}%
                  </span>
                )}
                {product.isBestseller && (
                  <span className="bg-linen-50 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-ink-900">
                    Bestseller
                  </span>
                )}
              </>
            )}
          </div>

          <WishlistButton product={product} className="absolute right-3 top-3 z-10" />
        </div>

        {/* Bilgi alanı — ad, altında fiyat, ən altda material + rəng nöqtələri; hover-da bir az qalxır */}
        <div className="pb-2 pt-4 transition-transform duration-500 ease-[var(--ease-editorial)] group-hover/card:-translate-y-0.5">
          <h3 className="font-display text-[17px] font-normal leading-snug tracking-[-0.005em] text-ink-900 md:text-lg">
            <Link
              to={detailPath}
              title={product.name}
              className="line-clamp-2 transition-colors duration-300 group-hover/card:text-clay-600 hover:text-clay-600 focus-visible:underline focus-visible:outline-none"
            >
              {product.name}
            </Link>
          </h3>
          <p className="mt-1.5 flex items-baseline gap-2 font-sans tabular-nums">
            {product.compareAtPrice && (
              <span className="text-sm text-ink-500 line-through">
                <span className="sr-only">Əvvəlki qiymət: </span>
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
            <span
              className={`text-[15px] font-medium transition-[letter-spacing] duration-500 ease-[var(--ease-editorial)] group-hover/card:tracking-[0.02em] ${
                product.compareAtPrice ? 'text-clay-600' : 'text-ink-900'
              }`}
            >
              {formatPrice(product.basePrice)}
            </span>
          </p>

          <div className="mt-3 flex items-center justify-between gap-4 border-t border-linen-200 pt-3">
            <span className="block min-w-0 truncate text-[11px] uppercase tracking-[0.12em] text-ink-500">{material}</span>
            {product.colors.length > 0 && (
              <div className="-my-1.5 -mr-1.5">
                <ColorSwatches
                  colors={product.colors}
                  selectedIndex={colorIndex}
                  onSelect={setColorIndex}
                  max={MAX_SWATCHES}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
