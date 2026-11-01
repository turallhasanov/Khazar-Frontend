import { apiClient } from './api.js'

/**
 * Product reviews adapter for the Khazar WebAPI (/api/khazar/products/{productId}/reviews).
 * Reading is public; writing needs a signed-in user (apiClient attaches the access token).
 * Failures throw ApiError; `error.code` carries the API's errorCode, e.g. "review_already_exists".
 */

const reviewsPath = (productId) => `/khazar/products/${encodeURIComponent(productId)}/reviews`

/**
 * GET — approved reviews (newest first) with averageRating, reviewCount and
 * ratingDistribution ({ "1": n, …, "5": n }).
 */
export function getProductReviews(productId, { signal } = {}) {
  return apiClient(reviewsPath(productId), { signal, auth: false })
}

/** POST — submits a review for moderation; the returned review has status "Pending". */
export function createProductReview(productId, { rating, comment }) {
  return apiClient(reviewsPath(productId), {
    method: 'POST',
    body: JSON.stringify({ rating, comment }),
  })
}
