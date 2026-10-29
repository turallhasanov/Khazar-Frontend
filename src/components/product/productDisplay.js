/** Unsplash serves any width from the same URL; other hosts get no srcset and load as stored. */
export function unsplashSrcSet(url) {
  if (!url?.startsWith('https://images.unsplash.com/')) return undefined
  return [400, 600, 900, 1200]
    .map((width) => {
      const sized = new URL(url)
      sized.searchParams.set('w', String(width))
      return `${sized} ${width}w`
    })
    .join(', ')
}

/** Total units across sizes; null when the API sent no stock breakdown (unknown, not sold out). */
export function totalStock(stock) {
  const counts = Object.values(stock ?? {})
  return counts.length ? counts.reduce((sum, count) => sum + count, 0) : null
}

/** A size without a stock entry counts as available — the API may omit the breakdown. */
export function sizeInStock(product, size) {
  return (product.stock?.[size] ?? 1) > 0
}

/** Whole-percent discount, or null when the product is not reduced. */
export function discountPercent(product) {
  return product.compareAtPrice ? Math.round((1 - product.basePrice / product.compareAtPrice) * 100) : null
}
