import { apiClient } from './api.js'

/**
 * Admin adapter for the Khazar WebAPI (/api/admin). Every call needs the access token of a platform admin
 * (an account listed in "Admin:Emails" or the seeded SuperAdmin); other accounts get 403.
 */

/** GET /admin/session — 200 with the user when the signed-in account is an admin, 403 otherwise. */
export function getAdminSession({ signal } = {}) {
  return apiClient('/admin/session', { signal })
}

/** GET /admin/reviews — reviews of every status, newest first; `status` (Pending/Approved/Rejected) filters them. */
export function getReviewsForModeration({ status, signal } = {}) {
  const query = status ? `?status=${encodeURIComponent(status)}` : ''
  return apiClient(`/admin/reviews${query}`, { signal })
}

/** PATCH /admin/reviews/{id}/status — returns the updated review. Only approved reviews are published. */
export function updateReviewStatus(reviewId, status) {
  return apiClient(`/admin/reviews/${encodeURIComponent(reviewId)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

/** DELETE /admin/reviews/{id} — permanent; rejecting only hides a review. */
export function deleteReview(reviewId) {
  return apiClient(`/admin/reviews/${encodeURIComponent(reviewId)}`, { method: 'DELETE' })
}

// ---------- Products (/admin/products) ----------
// Every call that changes a product returns the whole updated AdminProductDto, so the list can replace it in place.
// errorCode values: invalid_name, invalid_slug, slug_taken, invalid_description, invalid_category, invalid_fabric,
// invalid_price, invalid_cover_image, variants_required, invalid_size, invalid_color, invalid_sku, sku_taken,
// variant_exists, invalid_stock, stock_changed, product_has_orders, variant_has_orders, last_variant.

const productPath = (id) => `/admin/products/${encodeURIComponent(id)}`
const variantPath = (productId, variantId) => `${productPath(productId)}/variants/${encodeURIComponent(variantId)}`
const json = (method, body) => ({ method, body: JSON.stringify(body) })

/** GET — every product, archived ones included, by name. */
export function getAdminProducts({ signal } = {}) {
  return apiClient('/admin/products', { signal })
}

/** POST — `product` includes `variants` (at least one). Returns the created product. */
export function createProduct(product) {
  return apiClient('/admin/products', json('POST', product))
}

/** PUT — name, slug, description, category, fabric, price, coverImage, isFeatured. Variants are separate calls. */
export function updateProduct(productId, fields) {
  return apiClient(productPath(productId), json('PUT', fields))
}

export function archiveProduct(productId) {
  return apiClient(`${productPath(productId)}/archive`, { method: 'POST' })
}

export function restoreProduct(productId) {
  return apiClient(`${productPath(productId)}/restore`, { method: 'POST' })
}

/** DELETE — only for products that were never ordered (409 "product_has_orders" otherwise). */
export function deleteProduct(productId) {
  return apiClient(productPath(productId), { method: 'DELETE' })
}

export function addVariant(productId, variant) {
  return apiClient(`${productPath(productId)}/variants`, json('POST', variant))
}

export function updateVariantStock(productId, variantId, stockQuantity) {
  return apiClient(variantPath(productId, variantId), json('PATCH', { stockQuantity }))
}

/** DELETE — only for variants that were never ordered and are not the product's last one. */
export function removeVariant(productId, variantId) {
  return apiClient(variantPath(productId, variantId), { method: 'DELETE' })
}
