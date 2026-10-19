import { apiClient } from './api.js'

/**
 * Catalog adapter for the Khazar WebAPI.
 * The API's ProductListDto / ProductDetailDto already mirror the storefront Product shape;
 * normalizeProduct only fills the fields the API does not provide yet.
 */

/**
 * Swatch colors by color name. The domain stores color names only, so the API sends hex: null;
 * these values keep the color pickers rendering until the API carries hex codes.
 */
const COLOR_SWATCHES = {
  'Ağ': '#f5f4ef',
  Antrasit: '#3a3a38',
  Bej: '#d8cbb4',
  Boz: '#9a9a94',
  'Dəvə': '#b49a6c',
  Haki: '#6d6a4f',
  Krem: '#ece5d8',
  Qara: '#1d1c1a',
  'Qəhvəyi': '#7a5c44',
  Qum: '#c9b99a',
  'Tozlu mavi': '#8b9bab',
  'Tünd boz': '#4c4a45',
  'Tünd yaşıl': '#3d4a3a',
}

const FALLBACK_SWATCH = '#c8c4bb'

/** Fills defaults for optional API fields so components can read them without null checks. */
export function normalizeProduct(product) {
  return {
    ...product,
    description: product.description ?? '',
    compareAtPrice: product.compareAtPrice ?? undefined,
    colors: (product.colors ?? []).map((color) => ({
      name: color.name,
      hex: color.hex ?? COLOR_SWATCHES[color.name] ?? FALLBACK_SWATCH,
    })),
    sizes: product.sizes ?? [],
    images: (product.images ?? []).filter(Boolean),
    fabric: { care: [], ...product.fabric },
    stock: product.stock ?? {},
  }
}

/**
 * GET /products — full catalog, or GET /products?category={category} when a category is given.
 * An unknown category yields an empty list, not a 404.
 */
export async function getProducts({ category, signal } = {}) {
  const query = category ? `?${new URLSearchParams({ category })}` : ''
  const products = await apiClient(`/products${query}`, { signal })
  return products.map(normalizeProduct)
}

/** GET /products/slug/{slug} — product page payload; throws ApiError with status 404 when unknown. */
export async function getProductBySlug(slug, { signal } = {}) {
  const product = await apiClient(`/products/slug/${encodeURIComponent(slug)}`, { signal })
  return normalizeProduct(product)
}
