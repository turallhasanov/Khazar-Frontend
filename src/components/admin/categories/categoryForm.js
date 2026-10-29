import { ApiError } from '../../../services/api.js'

/**
 * Category form rules. They mirror AdminCategoryAppService on the API (same limits and patterns); the API stays the
 * authority and its errorCode is mapped back to the same fields.
 */

export const LIMITS = { name: 100, label: 100, slug: 100, maxSortOrder: 10000 }

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const emptyFields = (sortOrder = 0) => ({ label: '', name: '', slug: '', sortOrder: String(sortOrder) })

export function fieldsFromCategory(category) {
  return { label: category.label, name: category.name, slug: category.slug, sortOrder: String(category.sortOrder) }
}

export function fieldsToRequest(fields) {
  return {
    name: fields.name.trim(),
    label: fields.label.trim(),
    slug: fields.slug.trim().toLowerCase(),
    sortOrder: Number(fields.sortOrder),
  }
}

/** Field errors, keyed by field name; empty when valid. */
export function validateFields(fields) {
  const errors = {}
  const label = fields.label.trim()
  if (!label) errors.label = 'Mağazada görünən adı daxil edin.'
  else if (label.length > LIMITS.label) errors.label = `Ən çox ${LIMITS.label} simvol.`

  const name = fields.name.trim()
  if (!name) errors.name = 'Açar adı daxil edin (məs. Coat).'
  else if (name.length > LIMITS.name) errors.name = `Ən çox ${LIMITS.name} simvol.`

  const slug = fields.slug.trim()
  if (!slug) errors.slug = 'Slug daxil edin.'
  else if (!SLUG_PATTERN.test(slug) || slug.length > LIMITS.slug)
    errors.slug = 'Yalnız kiçik latın hərfləri, rəqəmlər və tək tire (məs. palto).'

  const sortOrder = Number(fields.sortOrder)
  if (fields.sortOrder === '' || !Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > LIMITS.maxSortOrder)
    errors.sortOrder = `0–${LIMITS.maxSortOrder} arası tam ədəd.`

  return errors
}

/** API errorCode → [field, message]; field null = shown above the form or as a toast. */
const API_ERRORS = {
  invalid_name: ['name', 'Açar ad tələb olunur (ən çox 100 simvol).'],
  invalid_label: ['label', 'Görünən ad tələb olunur (ən çox 100 simvol).'],
  invalid_slug: ['slug', 'Yalnız kiçik latın hərfləri, rəqəmlər və tək tire.'],
  invalid_sort_order: ['sortOrder', `Sıra 0 ilə ${LIMITS.maxSortOrder} arasında olmalıdır.`],
  category_name_taken: ['name', 'Bu açar ad artıq başqa kateqoriyadadır.'],
  category_slug_taken: ['slug', 'Bu slug artıq başqa kateqoriyadadır.'],
  category_has_products: [null, 'Bu kateqoriyada hələ məhsul var — əvvəlcə onları başqa kateqoriyaya keçirin.'],
}

/** { field, message } for a failed request; field is a form field or null. */
export function describeCategoryError(error) {
  if (error instanceof ApiError) {
    if (error.code && API_ERRORS[error.code]) {
      const [field, message] = API_ERRORS[error.code]
      return { field, message }
    }
    if (error.status === 403) return { field: null, message: 'Admin icazəniz yoxdur.' }
    if (error.status === 404) return { field: null, message: 'Kateqoriya tapılmadı — siyahını yeniləyin.' }
    if (error.status === 0) return { field: null, message: 'Serverə qoşulmaq mümkün olmadı.' }
  }
  return { field: null, message: 'Əməliyyat alınmadı. Bir az sonra yenidən cəhd edin.' }
}
