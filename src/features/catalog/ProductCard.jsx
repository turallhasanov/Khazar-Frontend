import { formatPrice } from '../../shared/lib/formatPrice.js'

export function ProductCard({ product }) {
  return (
    <article className="h-full border border-neutral-200 p-4">
      <h2 className="text-base font-medium">{product.name}</h2>
      <p className="mt-1 text-sm text-neutral-500">{product.unit}</p>
      <p className="mt-4 text-sm">{formatPrice(product.price)}</p>
    </article>
  )
}
