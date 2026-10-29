import { apiClient } from './api.js'
import { announceChange } from './liveUpdates.js'

/**
 * Admin adapter for the Khazar WebAPI (/api/admin). Every call needs the access token of a platform admin
 * (an account listed in "Admin:Emails" or the seeded SuperAdmin); other accounts get 403.
 * Every successful change announces its topic (liveUpdates.js), so open storefront tabs reload that data at once.
 */

/** Resolves like `request`; on success tells the storefront tabs that `topics` changed. */
async function announcing(request, ...topics) {
  const result = await request
  topics.forEach(announceChange)
  return result
}

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
  return announcing(
    apiClient(`/admin/reviews/${encodeURIComponent(reviewId)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
    'reviews',
    'catalog',
  )
}

/** DELETE /admin/reviews/{id} — permanent; rejecting only hides a review. */
export function deleteReview(reviewId) {
  return announcing(apiClient(`/admin/reviews/${encodeURIComponent(reviewId)}`, { method: 'DELETE' }), 'reviews', 'catalog')
}

// ---------- Products (/admin/products) ----------
// Every call that changes a product returns the whole updated AdminProductDto, so the list can replace it in place.
// errorCode values: invalid_name, invalid_slug, slug_taken, invalid_description, invalid_category, invalid_fabric,
// invalid_price, invalid_cover_image, variants_required, invalid_size, invalid_color, invalid_sku, sku_taken,
// variant_exists, invalid_stock, stock_changed, product_has_orders, variant_has_orders, last_variant.

const productPath = (id) => `/admin/products/${encodeURIComponent(id)}`
const variantPath = (productId, variantId) => `${productPath(productId)}/variants/${encodeURIComponent(variantId)}`
const json = (method, body) => ({ method, body: JSON.stringify(body) })

// ---------- Categories (/admin/categories) ----------
// A category is { id, name, label, slug, sortOrder, productCount }. Products reference it by `categoryId`.
// errorCode values: invalid_name, invalid_label, invalid_slug, invalid_sort_order, category_name_taken,
// category_slug_taken, category_has_products.

const categoryPath = (id) => `/admin/categories/${encodeURIComponent(id)}`

/** GET — every category in storefront order, with its product count. */
export function getAdminCategories({ signal } = {}) {
  return apiClient('/admin/categories', { signal })
}

/** POST — `category` is { name, label, slug, sortOrder }. Returns the created category. */
export function createCategory(category) {
  return announcing(apiClient('/admin/categories', json('POST', category)), 'catalog')
}

/** PUT — renaming applies to every product in the category. Returns the updated category. */
export function updateCategory(categoryId, fields) {
  return announcing(apiClient(categoryPath(categoryId), json('PUT', fields)), 'catalog')
}

/** DELETE — only for categories without products (409 "category_has_products" otherwise). */
export function deleteCategory(categoryId) {
  return announcing(apiClient(categoryPath(categoryId), { method: 'DELETE' }), 'catalog')
}

/** GET — every product, archived ones included, by name. */
export function getAdminProducts({ signal } = {}) {
  return apiClient('/admin/products', { signal })
}

/** POST — `product` includes `variants` (at least one). Returns the created product. */
export function createProduct(product) {
  return announcing(apiClient('/admin/products', json('POST', product)), 'catalog')
}

/** PUT — name, slug, description, categoryId, fabric, price, coverImage, isFeatured. Variants are separate calls. */
export function updateProduct(productId, fields) {
  return announcing(apiClient(productPath(productId), json('PUT', fields)), 'catalog')
}

export function archiveProduct(productId) {
  return announcing(apiClient(`${productPath(productId)}/archive`, { method: 'POST' }), 'catalog')
}

export function restoreProduct(productId) {
  return announcing(apiClient(`${productPath(productId)}/restore`, { method: 'POST' }), 'catalog')
}

/** DELETE — only for products that were never ordered (409 "product_has_orders" otherwise). */
export function deleteProduct(productId) {
  return announcing(apiClient(productPath(productId), { method: 'DELETE' }), 'catalog')
}

export function addVariant(productId, variant) {
  return announcing(apiClient(`${productPath(productId)}/variants`, json('POST', variant)), 'catalog')
}

export function updateVariantStock(productId, variantId, stockQuantity) {
  return announcing(apiClient(variantPath(productId, variantId), json('PATCH', { stockQuantity })), 'catalog')
}

/** DELETE — only for variants that were never ordered and are not the product's last one. */
export function removeVariant(productId, variantId) {
  return announcing(apiClient(variantPath(productId, variantId), { method: 'DELETE' }), 'catalog')
}

// ---------- Content (/admin/content/sections, /admin/journal-articles, /admin/lookbook-looks, /admin/faq-items) ----------
// errorCode values: invalid_content (the message names the field: "Field 'hero.ctaLink' …"), invalid_slug,
// article_slug_taken, invalid_hotspot_product.

/** GET — [{ key, data, updatedAt }] for every section; never-saved ones have empty fields and updatedAt null. */
export function getContentSections({ signal } = {}) {
  return apiClient('/admin/content/sections', { signal })
}

/** PUT — replaces the whole section; returns { key, data, updatedAt } with the stored (trimmed) values. */
export function saveContentSection(key, data) {
  return announcing(apiClient(`/admin/content/sections/${encodeURIComponent(key)}`, json('PUT', data)), 'content')
}

/**
 * CRUD helpers for a content collection: list, create, update, remove. Every change announces 'content'.
 * Articles: { slug, title, excerpt, coverImageUrl, meta, sections: [{ heading, paragraphs, imageUrl, imageAlt }],
 * sortOrder, isPublished }. Looks: { title, imageUrl, ctaLabel, ctaLink, hotspots: [{ productSlug, x, y }],
 * sortOrder, isPublished }. FAQ items: { question, answer, sortOrder, isPublished }.
 */
function contentCollection(path) {
  const itemPath = (id) => `${path}/${encodeURIComponent(id)}`
  return {
    list: ({ signal } = {}) => apiClient(path, { signal }),
    create: (fields) => announcing(apiClient(path, json('POST', fields)), 'content'),
    update: (id, fields) => announcing(apiClient(itemPath(id), json('PUT', fields)), 'content'),
    remove: (id) => announcing(apiClient(itemPath(id), { method: 'DELETE' }), 'content'),
  }
}

export const journalArticlesApi = contentCollection('/admin/journal-articles')
export const lookbookLooksApi = contentCollection('/admin/lookbook-looks')
export const faqItemsApi = contentCollection('/admin/faq-items')

// ---------- Orders (/admin/orders) ----------
// An order is the checkout's OrderResponseDto. errorCode: invalid_order_status (the transition is not allowed).

const orderPath = (id) => `/admin/orders/${encodeURIComponent(id)}`

/** GET — every order, newest first. */
export function getAdminOrders({ signal } = {}) {
  return apiClient('/admin/orders', { signal })
}

/** POST — SyncedToErp → Completed. Returns the updated order. */
export function completeOrder(orderId) {
  return apiClient(`${orderPath(orderId)}/complete`, { method: 'POST' })
}

/** POST — cancels and returns the items to stock (so the storefront catalog changes too). */
export function cancelOrder(orderId) {
  return announcing(apiClient(`${orderPath(orderId)}/cancel`, { method: 'POST' }), 'catalog')
}

/** POST — queues a Pending order for another NexusERP push (202). */
export function retryOrderErpSync(orderId) {
  return apiClient(`${orderPath(orderId)}/erp-sync`, { method: 'POST' })
}

// ---------- Inbox (/admin/contact-messages, /admin/newsletter-subscribers) ----------

const messagePath = (id) => `/admin/contact-messages/${encodeURIComponent(id)}`
const subscriberPath = (id) => `/admin/newsletter-subscribers/${encodeURIComponent(id)}`

/** GET — contact form messages, newest first: { id, name, email, message, isRead, readAt, createdAt }. */
export function getContactMessages({ signal } = {}) {
  return apiClient('/admin/contact-messages', { signal })
}

export function setContactMessageRead(messageId, isRead) {
  return apiClient(messagePath(messageId), json('PATCH', { isRead }))
}

export function deleteContactMessage(messageId) {
  return apiClient(messagePath(messageId), { method: 'DELETE' })
}

/** GET — newsletter addresses: { id, email, isActive, subscribedAt, unsubscribedAt }. */
export function getNewsletterSubscribers({ signal } = {}) {
  return apiClient('/admin/newsletter-subscribers', { signal })
}

export function setNewsletterSubscriberActive(subscriberId, isActive) {
  return apiClient(subscriberPath(subscriberId), json('PATCH', { isActive }))
}

export function deleteNewsletterSubscriber(subscriberId) {
  return apiClient(subscriberPath(subscriberId), { method: 'DELETE' })
}
