import { apiClient } from './api.js'

/**
 * Newsletter adapter for the Khazar WebAPI. Anonymous: no access token is sent.
 * subscribe fails with ApiError code "already_subscribed" (409) or "invalid_email" (400).
 */

const post = (path, email) =>
  apiClient(`/khazar${path}`, { method: 'POST', body: JSON.stringify({ email }), auth: false })

/** POST /khazar/subscribe — returns { email, isActive, subscribedAt, reactivated }. */
export function subscribe(email) {
  return post('/subscribe', email)
}

/** POST /khazar/unsubscribe — succeeds for unknown addresses too. */
export function unsubscribe(email) {
  return post('/unsubscribe', email)
}
