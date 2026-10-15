import { Link } from 'react-router-dom'
import { formatPrice } from '../../services/formatPrice.js'

/**
 * Lüks katalog kartı — sınırsız, ultra-clean editoryal görünüm.
 * - Hover'da birincil görsel yumuşakça söner, ikincil editoryal görsel belirir
 * - Rozetler: dolgusuz, ince bakır tipografi (YENİ / BESTSELLER / −%15)
 * - Serif (ad) + sans-serif (detay/fiyat) ince ağırlık dengesi
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
      {/* Görsel alanı — çerçevesiz, crossfade hover */}
      <div className="relative aspect-[2/3] overflow-hidden bg-linen-100">
        <Link to={detailPath} aria-label={product.name} className="absolute inset-0 block">
          <img
            src={primaryImage}
            alt={product.name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out group-hover:opacity-0"
          />
          {secondaryImage && (
            <img
              src={secondaryImage}
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 ease-out group-hover:opacity-100"
            />
          )}
        </Link>

        {/* İnce tipografik etiketler */}
        <div className="absolute left-4 top-4 flex flex-col items-start gap-1.5">
          {product.isNew && (
            <span className="text-[10px] font-medium uppercase tracking-[0.35em] text-clay-600">
              Yeni
            </span>
          )}
          {product.isBestseller && (
            <span className="text-[10px] font-medium uppercase tracking-[0.35em] text-ink-500">
              Bestseller
            </span>
          )}
          {discountPercent && (
            <span className="text-[10px] font-medium uppercase tracking-[0.35em] text-clay-600">
              −{discountPercent}%
            </span>
          )}
        </div>

        {/* Quick View — hover'da ince bant (masaüstü) */}
        <Link
          to={detailPath}
          className="absolute inset-x-0 bottom-0 hidden bg-linen-50/85 py-3 text-center backdrop-blur-sm transition-opacity duration-500 ease-out md:block md:opacity-0 md:group-hover:opacity-100"
        >
          <span className="text-[10px] font-medium uppercase tracking-[0.35em] text-ink-900 underline-offset-4 hover:underline">
            Quick View
          </span>
        </Link>
      </div>

      {/* Bilgi alanı */}
      <div className="pt-4">
        <p className="text-[9px] font-light uppercase tracking-[0.3em] text-ink-400">
          {fabricLabel}
        </p>
        <div className="mt-1.5 flex items-baseline justify-between gap-3">
          <h3 className="font-display text-base font-normal tracking-[0.03em] text-ink-900">
            <Link to={detailPath} className="transition-colors hover:text-clay-600">
              {product.name}
            </Link>
          </h3>
          <div className="flex shrink-0 items-baseline gap-2 text-sm font-light tracking-[0.05em]">
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
              className="h-2.5 w-2.5 rounded-full border border-ink-900/10"
              style={{ backgroundColor: color.hex }}
            />
          ))}
        </div>

        {/* Quick View — mobil (hover olmadığı için daima görünür, ince link) */}
        <Link
          to={detailPath}
          className="mt-3 inline-block text-[10px] font-medium uppercase tracking-[0.3em] text-ink-500 underline-offset-4 transition-colors hover:text-ink-900 hover:underline md:hidden"
        >
          Quick View
        </Link>
      </div>
    </article>
  )
}
