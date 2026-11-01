import { ApiError } from '../../../services/api.js'

/**
 * Turns a content API error into { field, message }. "invalid_content" messages name the field as a path —
 * "Field 'pillars[0].title' can be at most 500 characters." — which is the same path SchemaForm uses as an error key.
 */
const PROBLEMS = [
  [/is required/, () => 'Bu xana mütləqdir.'],
  [/can be at most (\d+) characters/, (n) => `Ən çox ${n} simvol ola bilər.`],
  [/can have at most (\d+) items/, (n) => `Ən çox ${n} element ola bilər.`],
  [/must be a site path/, () => 'Link "/" ilə başlamalı (məs. /katalog) və ya https:// ünvanı olmalıdır.'],
  [/must be between (\S+) and (\S+)/, (min, max) => `${min} – ${max} aralığında olmalıdır.`],
  [/needs at least one paragraph/, () => 'Ən azı bir paraqraf yazın.'],
  [/not a valid email/, () => 'E-poçt formatı yanlışdır.'],
  [/unknown or has the wrong type/, () => 'Dəyər yanlışdır.'],
]

export function describeContentError(error) {
  if (!(error instanceof ApiError)) return { message: 'Gözlənilməz xəta baş verdi.' }
  if (error.status === 0) return { message: 'Serverə qoşulmaq mümkün olmadı.' }
  if (error.status === 401 || error.status === 403) return { message: 'Admin icazəniz yoxdur və ya sessiya bitib.' }
  if (error.status === 404) return { message: 'Bu qeyd artıq mövcud deyil — siyahını yeniləyin.' }

  switch (error.code) {
    case 'invalid_slug':
      return { field: 'slug', message: 'Yalnız kiçik hərf, rəqəm və tire (məs. kapsul-qarderob).' }
    case 'article_slug_taken':
      return { field: 'slug', message: 'Bu slug başqa məqalədə istifadə olunur.' }
    case 'invalid_hotspot_product':
      return { field: 'hotspots', message: 'Seçilmiş məhsul tapılmadı.' }
    case 'invalid_content': {
      const field = /Field '([^']+)'/.exec(error.message)?.[1]
      for (const [pattern, text] of PROBLEMS) {
        const match = pattern.exec(error.message)
        if (match) return { field, message: text(...match.slice(1)) }
      }
      return { field, message: 'Dəyər yanlışdır.' }
    }
    default:
      return { message: error.message || 'Yadda saxlanmadı.' }
  }
}
