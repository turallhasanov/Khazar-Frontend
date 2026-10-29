import { ApiError } from '../../../services/api.js'

/**
 * Product form rules. They mirror AdminProductAppService on the API (same limits and patterns), so most mistakes
 * are caught before a request; the API stays the authority and its errorCode is mapped back to the same fields.
 */

export const LIMITS = {
  name: 200,
  slug: 200,
  description: 4000,
  fabric: 200,
  coverImage: 1000,
  size: 16,
  color: 64,
  sku: 64,
  maxPrice: 100000,
  maxStock: 100000,
}

export const LOW_STOCK = 5

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const PRICE_PATTERN = /^\d+(?:\.\d{1,2})?$/

/** "89,90" and "89.90" both mean 89.90: Azerbaijani writes decimals with a comma. */
const normalizePrice = (value) => String(value).trim().replace(',', '.')
const SKU_PATTERN = /^[A-Z0-9]+(?:-[A-Z0-9]+)*$/

// Azerbaijani letters that have no ASCII form in a URL.
const TRANSLITERATION = { ə: 'e', ı: 'i', ö: 'o', ü: 'u', ş: 's', ç: 'c', ğ: 'g' }

/** "Qış Paltosu — Yun" → "qis-paltosu-yun" */
export function slugify(value) {
  return value
    .toLocaleLowerCase('az')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[əıöüşçğ]/g, (letter) => TRANSLITERATION[letter])
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, LIMITS.slug)
}

export const emptyFields = {
  name: '',
  slug: '',
  description: '',
  categoryId: '',
  fabric: '',
  price: '',
  coverImage: '',
  isFeatured: false,
}

let nextVariantKey = 1
export const emptyVariant = () => ({ key: nextVariantKey++, size: '', color: '', sku: '', stockQuantity: '0' })

export function fieldsFromProduct(product) {
  return {
    name: product.name,
    slug: product.slug,
    description: product.description,
    categoryId: product.categoryId,
    fabric: product.fabric,
    price: product.price.toFixed(2).replace('.', ','),
    coverImage: product.coverImage,
    isFeatured: product.isFeatured,
  }
}

/** The request body for POST/PUT. Price is sent as a number; text is trimmed like the API does. */
export function fieldsToRequest(fields) {
  return {
    name: fields.name.trim(),
    slug: fields.slug.trim().toLowerCase(),
    description: fields.description.trim(),
    categoryId: fields.categoryId,
    fabric: fields.fabric.trim(),
    price: Number(normalizePrice(fields.price)),
    coverImage: fields.coverImage.trim(),
    isFeatured: fields.isFeatured,
  }
}

export function variantToRequest(variant) {
  return {
    size: variant.size.trim().toUpperCase(),
    color: variant.color.trim(),
    sku: variant.sku.trim().toUpperCase(),
    stockQuantity: Number(variant.stockQuantity),
  }
}

const isHttpUrl = (value) => {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

/** Field errors of the product fields, keyed by field name; empty when valid. */
export function validateFields(fields) {
  const errors = {}
  const name = fields.name.trim()
  if (!name) errors.name = 'Məhsulun adını daxil edin.'
  else if (name.length > LIMITS.name) errors.name = `Ad ən çox ${LIMITS.name} simvol ola bilər.`

  const slug = fields.slug.trim()
  if (!slug) errors.slug = 'Slug daxil edin.'
  else if (!SLUG_PATTERN.test(slug) || slug.length > LIMITS.slug)
    errors.slug = 'Yalnız kiçik latın hərfləri, rəqəmlər və tək tire (məs. heavyweight-hoodie).'

  if (fields.description.trim().length > LIMITS.description)
    errors.description = `Təsvir ən çox ${LIMITS.description} simvol ola bilər.`

  if (!fields.categoryId) errors.categoryId = 'Kateqoriya seçin.'

  if (!fields.fabric.trim()) errors.fabric = 'Parça tərkibini daxil edin.'
  else if (fields.fabric.trim().length > LIMITS.fabric) errors.fabric = `Ən çox ${LIMITS.fabric} simvol.`

  // A pattern, not arithmetic: 89.9 * 100 is 8990.000000000001 in floating point.
  const priceText = normalizePrice(fields.price)
  const price = Number(priceText)
  if (!priceText) errors.price = 'Qiyməti daxil edin.'
  else if (!PRICE_PATTERN.test(priceText)) errors.price = 'Rəqəm, ən çox iki onluq (məs. 89,90).'
  else if (price <= 0 || price > LIMITS.maxPrice) errors.price = `Qiymət 0-dan böyük və ən çox ${LIMITS.maxPrice} ₼ olmalıdır.`

  const coverImage = fields.coverImage.trim()
  if (!coverImage) errors.coverImage = 'Şəkil ünvanını daxil edin.'
  else if (!isHttpUrl(coverImage) || coverImage.length > LIMITS.coverImage)
    errors.coverImage = 'Tam http(s) ünvanı daxil edin (məs. https://images.unsplash.com/…).'

  return errors
}

/** Field errors of one variant row. `takenSkus` / `takenPairs` are used by the rows above it and by the product. */
export function validateVariant(variant, { takenSkus = new Set(), takenPairs = new Set() } = {}) {
  const errors = {}
  const size = variant.size.trim().toUpperCase()
  const color = variant.color.trim()
  const sku = variant.sku.trim().toUpperCase()

  if (!size) errors.size = 'Ölçü'
  else if (size.length > LIMITS.size) errors.size = `Ən çox ${LIMITS.size}`

  if (!color) errors.color = 'Rəng'
  else if (color.length > LIMITS.color) errors.color = `Ən çox ${LIMITS.color}`

  if (!sku) errors.sku = 'SKU'
  else if (!SKU_PATTERN.test(sku) || sku.length > LIMITS.sku) errors.sku = 'Hərf, rəqəm, tire'
  else if (takenSkus.has(sku)) errors.sku = 'Təkrarlanır'

  if (!errors.size && !errors.color && takenPairs.has(`${color.toUpperCase()}|${size}`)) errors.color = 'Bu rəng + ölçü var'

  const stock = Number(variant.stockQuantity)
  if (variant.stockQuantity === '' || !Number.isInteger(stock) || stock < 0 || stock > LIMITS.maxStock)
    errors.stockQuantity = `0–${LIMITS.maxStock}`

  return errors
}

/** Errors of a list of new variant rows, keyed by row key; also checks duplicates between the rows. */
export function validateVariantRows(rows, existing = []) {
  const takenSkus = new Set(existing.map((variant) => variant.sku.toUpperCase()))
  const takenPairs = new Set(existing.map((variant) => `${variant.color.toUpperCase()}|${variant.size.toUpperCase()}`))
  const errors = {}
  for (const row of rows) {
    const rowErrors = validateVariant(row, { takenSkus, takenPairs })
    if (Object.keys(rowErrors).length) errors[row.key] = rowErrors
    takenSkus.add(row.sku.trim().toUpperCase())
    takenPairs.add(`${row.color.trim().toUpperCase()}|${row.size.trim().toUpperCase()}`)
  }
  return errors
}

/** API errorCode → [field, message]; field null = shown above the form. */
const API_ERRORS = {
  invalid_name: ['name', 'Ad tələb olunur (ən çox 200 simvol).'],
  invalid_slug: ['slug', 'Yalnız kiçik latın hərfləri, rəqəmlər və tək tire.'],
  slug_taken: ['slug', 'Bu slug artıq başqa məhsulda istifadə olunur.'],
  invalid_description: ['description', 'Təsvir ən çox 4000 simvol ola bilər.'],
  invalid_category: ['categoryId', 'Mövcud kateqoriya seçin — bu kateqoriya silinmiş ola bilər.'],
  invalid_fabric: ['fabric', 'Parça tərkibi tələb olunur.'],
  invalid_price: ['price', 'Qiymət 0-dan böyük, ən çox 100 000 ₼, iki onluq rəqəmə qədər.'],
  invalid_cover_image: ['coverImage', 'Tam http(s) şəkil ünvanı daxil edin.'],
  variants_required: [null, 'Ən azı bir variant əlavə edin.'],
  invalid_size: ['variant', 'Ölçü düzgün deyil.'],
  invalid_color: ['variant', 'Rəng düzgün deyil.'],
  invalid_sku: ['variant', 'SKU yalnız hərf, rəqəm və tire ola bilər.'],
  sku_taken: ['variant', 'Bu SKU artıq başqa variantda istifadə olunur.'],
  variant_exists: ['variant', 'Bu rəng və ölçüdə variant artıq var.'],
  invalid_stock: ['variant', `Stok 0 ilə ${LIMITS.maxStock} arasında olmalıdır.`],
  stock_changed: [null, 'Bu arada sifariş verildi və stok dəyişdi. Məlumatı yeniləyib yenidən cəhd edin.'],
  product_has_orders: [null, 'Bu məhsul sifarişlərdə var — silmək olmaz, yalnız arxivləmək olar.'],
  variant_has_orders: [null, 'Bu variant sifarişlərdə var — silmək olmaz. Stokunu 0 edin.'],
  last_variant: [null, 'Məhsulun ən azı bir variantı qalmalıdır.'],
}

/** { field, message } for a failed request; field is a form field, "variant", or null. */
export function describeProductError(error) {
  if (error instanceof ApiError) {
    if (error.code && API_ERRORS[error.code]) {
      const [field, message] = API_ERRORS[error.code]
      return { field, message }
    }
    if (error.status === 403) return { field: null, message: 'Admin icazəniz yoxdur.' }
    if (error.status === 404) return { field: null, message: 'Məhsul tapılmadı — siyahını yeniləyin.' }
    if (error.status === 0) return { field: null, message: 'Serverə qoşulmaq mümkün olmadı.' }
  }
  return { field: null, message: 'Əməliyyat alınmadı. Bir az sonra yenidən cəhd edin.' }
}
