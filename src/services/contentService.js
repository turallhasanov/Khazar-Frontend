import { apiClient, mediaUrl } from './api.js'

/** Turns every stored "/images/…" path in a content response into its full address. */
function withMediaUrls(value) {
  if (typeof value === 'string') return mediaUrl(value)
  if (Array.isArray(value)) return value.map(withMediaUrls)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, withMediaUrls(entry)]))
  }
  return value
}

/**
 * Storefront content adapter (pages, lookbook, journal, FAQ, contact form). Everything here is managed in the admin
 * panel and stored in the database; the requests skip the HTTP cache so a saved change shows on the next load.
 */

/**
 * GET /content — { sections, lookbook, journal, faq }. `sections` holds the saved sections by key ("hero", "about",
 * "site", ...); a section that was never saved is absent, and the component that shows it renders nothing.
 */
export async function getSiteContent({ signal } = {}) {
  return withMediaUrls(await apiClient('/content', { signal, auth: false, cache: 'no-store' }))
}

/** GET /content/journal/{slug} — a published article with its `sections`; ApiError 404 when unknown. */
export async function getJournalArticle(slug, { signal } = {}) {
  return withMediaUrls(await apiClient(`/content/journal/${encodeURIComponent(slug)}`, { signal, auth: false, cache: 'no-store' }))
}

/** POST /contact-messages — `{ name, email, message }`; 400 "invalid_content" names the field, 429 when rate limited. */
export function sendContactMessage(message) {
  return apiClient('/contact-messages', { method: 'POST', auth: false, body: JSON.stringify(message) })
}

/** Path of a journal article page. */
export const articlePath = (slug) => `/journal/${slug}`
