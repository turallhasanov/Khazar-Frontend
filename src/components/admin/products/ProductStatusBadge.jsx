import { Star } from 'lucide-react'

/** "Aktiv" (on the storefront) / "Arxivdə" (hidden), plus a star when the product is featured. */
export function ProductStatusBadge({ product }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`inline-flex items-center gap-1.5 whitespace-nowrap border px-2 py-1 text-[9px] font-medium uppercase tracking-[0.22em] transition-colors duration-300 ${
          product.isActive ? 'border-sage-600/40 bg-sage-100 text-sage-700' : 'border-ink-900/15 bg-linen-100 text-ink-500'
        }`}
      >
        <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${product.isActive ? 'bg-sage-600' : 'bg-ink-400'}`} />
        {product.isActive ? 'Aktiv' : 'Arxivdə'}
      </span>
      {product.isFeatured && (
        <span title="Önə çıxan məhsul" className="text-clay-500">
          <Star size={12} strokeWidth={1.75} className="fill-current" aria-hidden="true" />
          <span className="sr-only">Önə çıxan</span>
        </span>
      )}
    </span>
  )
}
