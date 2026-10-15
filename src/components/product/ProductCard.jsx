import { Link } from 'react-router-dom'
import { formatPrice } from '../../services/formatPrice.js'

/**
 * Mikro-Aşama 6: Editoryal Ürün Kartı.
 * - Hover'da ikincil görsel geçişi (image swap)
 * - NEW / BESTSELLER / indirim rozeti
 * - Renk varyant daireleri (color swatches)
 * - Kumaş etiketi, fiyat (indirimli eski fiyat çizili)
 * - "Quick View" hover butonu (mobilde kart altında)
 */
export function ProductCard({ product }) {
  const [primaryImage, secondaryImage] = product.images
  const discountPercent = product.compareAtPrice
    ? Math.round((1 - product.basePrice / product.compareAtPrice) * 100)
    : null
  const detailPath = `/mehsul/${product.slug}`
  const fabricLabel = [product.fabric.material, product.fabric.weave]
    .filter(Boolean)
    .join(' · ')

  return (
    <article className="group">
      {/* Görsel alanı */}
      <div className="relative aspect-[3/4] overflow-hidden bg-linen-100">
        <Link to={detailPath} aria-label={product.name} className="absolute inset-0 block">
          <img
            src={primaryImage}
            alt={product.name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
          {secondaryImage && (
            <img
              src={secondaryImage}
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
            />
          )}
        </Link>

        {/* Rozetler */}
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {product.isNew && (
            <span className="bg-sage-600 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-linen-50">
              New
            </span>
          )}
          {product.isBestseller && (
            <span className="bg-ink-900 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-linen-50">
              Bestseller
            </span>
          )}
          {discountPercent && (
            <span className="bg-clay-500 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-linen-50">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Quick View — hover (masaüstü) */}
        <Link
          to={detailPath}
          className="absolute inset-x-0 bottom-0 hidden translate-y-full bg-linen-50/90 py-3 text-center backdrop-blur-sm transition-transform duration-300 ease-out hover:bg-linen-50 group-hover:translate-y-0 md:block"
        >
          <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-ink-900">
            Quick View
          </span>
        </Link>
      </div>

      {/* Bilgi alanı */}
      <div className="pt-4">
        <p className="text-[9px] uppercase tracking-[0.25em] text-ink-400">{fabricLabel}</p>
        <div className="mt-1.5 flex items-baseline justify-between gap-3">
          <h3 className="text-sm font-medium tracking-wide text-ink-900">
          <Link to={detailPath} className="transition-colors hover:text-clay-600">
            {product.name}
          </Link>
        </h3>
          <div className="flex shrink-0 items-baseline gap-2 text-sm">
            {product.compareAtPrice && (
              <span className="text-xs text-ink-400 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
            <span className={product.compareAtPrice ? 'text-clay-600' : 'text-ink-900'}>
              {formatPrice(product.basePrice)}
            </span>
          </div>
        </div>

        {/* Renk varyantları */}
        <div className="mt-2.5 flex items-center gap-1.5">
          {product.colors.map((color) => (
            <span
              key={color.name}
              title={color.name}
              className="h-3 w-3 rounded-full border border-ink-900/15"
              style={{ backgroundColor: color.hex }}
            />
          ))}
        </div>

        {/* Quick View — mobil (hover olmadığı için daima görünür) */}
        <Link
          to={detailPath}
          className="mt-3 block w-full border border-ink-900/20 py-2 text-center text-[10px] font-medium uppercase tracking-[0.3em] text-ink-700 transition-colors hover:border-ink-900 hover:text-ink-900 md:hidden"
        >
          Quick View
        </Link>
      </div>
    </article>
  )
}
