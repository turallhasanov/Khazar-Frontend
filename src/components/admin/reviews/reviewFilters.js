/**
 * Filtering, sorting and formatting for the moderation list. Filters live in the URL query, so a filtered view
 * survives a reload and can be shared; values equal to the default are left out of the URL.
 */

export const PAGE_SIZE = 10

export const FILTER_DEFAULTS = {
  status: 'Pending',
  q: '',
  rating: '',
  product: '',
  verified: '',
  from: '',
  to: '',
  sort: 'newest',
  page: '1',
}

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Ən yeni' },
  { value: 'oldest', label: 'Ən köhnə' },
  { value: 'rating-desc', label: 'Ən yüksək ulduz' },
  { value: 'rating-asc', label: 'Ən aşağı ulduz' },
]

export const STATUS_FILTERS = [
  { value: 'Pending', label: 'Gözləyən' },
  { value: 'Approved', label: 'Dərc olunmuş' },
  { value: 'Rejected', label: 'Rədd edilmiş' },
  { value: 'all', label: 'Hamısı' },
]

export function readFilters(searchParams) {
  return Object.fromEntries(
    Object.entries(FILTER_DEFAULTS).map(([key, fallback]) => [key, searchParams.get(key) ?? fallback]),
  )
}

/** Filters other than status, sort and page: these are what "Filtrləri təmizlə" resets. */
export function hasRefinements(filters) {
  return ['q', 'rating', 'product', 'verified', 'from', 'to'].some((key) => filters[key] !== FILTER_DEFAULTS[key])
}

const normalize = (value) => value.toLocaleLowerCase('az').trim()

// Date inputs give local calendar days; a review counts for the local day it was written on.
const startOfDay = (value) => new Date(`${value}T00:00:00`)
const endOfDay = (value) => new Date(`${value}T23:59:59.999`)

/** Every filter except status, so the status strip can count each status within the other filters. */
export function matchesRefinements(review, filters) {
  if (filters.rating && review.rating !== Number(filters.rating)) return false
  if (filters.product && review.productId !== filters.product) return false
  if (filters.verified === '1' && !review.isVerifiedBuyer) return false

  const createdAt = new Date(review.createdAt)
  if (filters.from && createdAt < startOfDay(filters.from)) return false
  if (filters.to && createdAt > endOfDay(filters.to)) return false

  const query = normalize(filters.q)
  if (query) {
    const haystack = normalize(`${review.userName} ${review.comment} ${review.productName}`)
    if (!haystack.includes(query)) return false
  }
  return true
}

export function matchesStatus(review, status) {
  return status === 'all' || review.status === status
}

const SORTERS = {
  newest: (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  oldest: (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt),
  'rating-desc': (a, b) => b.rating - a.rating || SORTERS.newest(a, b),
  'rating-asc': (a, b) => a.rating - b.rating || SORTERS.newest(a, b),
}

export function sortReviews(reviews, sort) {
  return [...reviews].sort(SORTERS[sort] ?? SORTERS.newest)
}

/** Distinct reviewed products for the product filter, alphabetically. */
export function productOptions(reviews) {
  const byId = new Map(reviews.map((review) => [review.productId, review.productName]))
  return [...byId].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name, 'az'))
}

/** Count per status, average rating and 1–5 distribution of the given reviews. */
export function summarize(reviews) {
  const counts = { all: reviews.length, Pending: 0, Approved: 0, Rejected: 0 }
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  let ratingSum = 0
  for (const review of reviews) {
    counts[review.status] = (counts[review.status] ?? 0) + 1
    distribution[review.rating] += 1
    ratingSum += review.rating
  }
  return { counts, distribution, average: reviews.length ? ratingSum / reviews.length : 0 }
}

// Written out instead of Intl: Chrome ships no full Azerbaijani locale data, so Intl gives "2026 M10 26" and
// English relative times ("yesterday").
const MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avqust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr']

const pad = (value) => String(value).padStart(2, '0')

/** "26 oktyabr 2026" */
export function formatDate(value) {
  const date = new Date(value)
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`
}

/** "26 oktyabr 2026, 22:58" */
export function formatDateTime(value) {
  const date = new Date(value)
  return `${formatDate(date)}, ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/** "indi", "5 dəqiqə əvvəl", "dünən", "3 gün əvvəl", "2 həftə əvvəl"; older than a month: the date. */
export function formatRelative(value, now = Date.now()) {
  const elapsed = now - Date.parse(value)
  if (elapsed < MINUTE) return 'indi'
  if (elapsed < HOUR) return `${Math.floor(elapsed / MINUTE)} dəqiqə əvvəl`
  if (elapsed < DAY) return `${Math.floor(elapsed / HOUR)} saat əvvəl`
  const days = Math.floor(elapsed / DAY)
  if (days === 1) return 'dünən'
  if (days < 7) return `${days} gün əvvəl`
  if (days < 30) return `${Math.floor(days / 7)} həftə əvvəl`
  return formatDate(value)
}

/** "4,3" — Azerbaijani decimal comma, independent of the browser's locale data. */
export const formatAverage = (value) => value.toFixed(1).replace('.', ',')
