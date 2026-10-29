/**
 * Fallback display names for the API's category values, used only when GET /api/categories did not load (the admin
 * panel manages the real labels). Unknown categories show as sent.
 */
const CATEGORY_LABELS = {
  Pants: 'Şalvar',
  Coat: 'Palto',
}

export const categoryLabel = (category) => CATEGORY_LABELS[category] ?? category
