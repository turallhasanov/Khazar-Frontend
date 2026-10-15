import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

const CATEGORY_OPTIONS = [
  'Hoodie',
  'T-Shirt',
  'Pants',
  'Sweatshirt',
  'Longsleeve',
  'Coat',
]

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

const SORT_OPTIONS = [
  { value: 'featured', label: 'Önə çıxanlar' },
  { value: 'price-asc', label: 'Qiymət: aşağıdan yuxarı' },
  { value: 'price-desc', label: 'Qiymət: yuxarıdan aşağı' },
  { value: 'newest', label: 'Ən yenilər' },
]

const barButton =
  'flex items-center gap-2 border px-4 py-2 text-[10px] font-medium uppercase tracking-[0.25em] transition-colors'
const panelClass =
  'absolute left-0 top-full z-40 mt-2 w-64 border border-linen-200 bg-linen-50 p-5 shadow-xl'
const panelTitle = 'text-[10px] font-medium uppercase tracking-[0.35em] text-ink-400'
const checkboxLabel =
  'flex cursor-pointer items-center gap-3 py-1 text-xs font-light tracking-[0.08em] text-ink-600 transition-colors hover:text-ink-900'
const checkboxInput =
  'h-3 w-3 shrink-0 appearance-none border border-ink-900/30 bg-transparent checked:border-ink-900 checked:bg-ink-900'

function toggleList(list, item) {
  return list.includes(item) ? list.filter((entry) => entry !== item) : [...list, item]
}

function countBadge(count) {
  if (!count) return null
  return (
    <span className="flex h-4 min-w-4 items-center justify-center bg-clay-500 px-1 text-[9px] font-semibold text-linen-50">
      {count}
    </span>
  )
}

/**
 * Radikal katalog düzeni — yatay editoryal filtre şeridi.
 * Kategori / Material / Ölçü / Qiymət açılır panelleri + sıralama.
 * Sidebar tamamen kaldırılmıştır; tüm kontroller ürünlerin üstünde.
 */
export function CatalogFilterBar({
  filters,
  bounds,
  materials,
  sort,
  onSortChange,
  onFiltersChange,
}) {
  const [open, setOpen] = useState(null)
  const close = () => setOpen(null)

  const priceActive =
    filters.priceMin !== bounds.priceFloor || filters.priceMax !== bounds.priceCeiling

  const triggerClass = (active) =>
    `${barButton} ${
      active ? 'border-ink-900 text-ink-900' : 'border-ink-900/15 text-ink-600 hover:border-ink-900/50'
    }`

  return (
    <div className="relative border-y border-linen-200 py-4">
      {/* Dışarı tıklama ile kapat */}
      {open && (
        <button
          type="button"
          aria-label="Filtre panelini bağla"
          tabIndex={-1}
          onClick={close}
          className="fixed inset-0 z-30 cursor-default"
        />
      )}

      <div className="flex flex-wrap items-center gap-2.5">
        <span className="mr-2 hidden text-[10px] uppercase tracking-[0.3em] text-ink-400 lg:block">
          Filtre
        </span>

        {/* Kateqoriya */}
        <div className="relative">
          <button
            type="button"
            aria-expanded={open === 'category'}
            onClick={() => setOpen(open === 'category' ? null : 'category')}
            className={triggerClass(open === 'category' || filters.categories.length > 0)}
          >
            Kateqoriya
            {countBadge(filters.categories.length)}
            <ChevronDown
              size={13}
              strokeWidth={1.5}
              className={`transition-transform duration-300 ${open === 'category' ? 'rotate-180' : ''}`}
            />
          </button>
          {open === 'category' && (
            <div className={panelClass}>
              <p className={panelTitle}>Kateqoriya</p>
              <div className="mt-4">
                {CATEGORY_OPTIONS.map((category) => (
                  <label key={category} className={checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={filters.categories.includes(category)}
                      onChange={() =>
                        onFiltersChange({
                          ...filters,
                          categories: toggleList(filters.categories, category),
                        })
                      }
                      className={checkboxInput}
                    />
                    {category}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Material */}
        <div className="relative">
          <button
            type="button"
            aria-expanded={open === 'material'}
            onClick={() => setOpen(open === 'material' ? null : 'material')}
            className={triggerClass(open === 'material' || filters.materials.length > 0)}
          >
            Material
            {countBadge(filters.materials.length)}
            <ChevronDown
              size={13}
              strokeWidth={1.5}
              className={`transition-transform duration-300 ${open === 'material' ? 'rotate-180' : ''}`}
            />
          </button>
          {open === 'material' && (
            <div className={`${panelClass} w-72`}>
              <p className={panelTitle}>Material</p>
              <div className="mt-4">
                {materials.map((material) => (
                  <label key={material} className={checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={filters.materials.includes(material)}
                      onChange={() =>
                        onFiltersChange({
                          ...filters,
                          materials: toggleList(filters.materials, material),
                        })
                      }
                      className={checkboxInput}
                    />
                    {material}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Ölçü */}
        <div className="relative">
          <button
            type="button"
            aria-expanded={open === 'size'}
            onClick={() => setOpen(open === 'size' ? null : 'size')}
            className={triggerClass(open === 'size' || filters.sizes.length > 0)}
          >
            Ölçü
            {countBadge(filters.sizes.length)}
            <ChevronDown
              size={13}
              strokeWidth={1.5}
              className={`transition-transform duration-300 ${open === 'size' ? 'rotate-180' : ''}`}
            />
          </button>
          {open === 'size' && (
            <div className={panelClass}>
              <p className={panelTitle}>Ölçü</p>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {SIZE_OPTIONS.map((size) => {
                  const active = filters.sizes.includes(size)
                  return (
                    <button
                      key={size}
                      type="button"
                      aria-pressed={active}
                      onClick={() =>
                        onFiltersChange({ ...filters, sizes: toggleList(filters.sizes, size) })
                      }
                      className={`border py-2 text-[11px] font-light tracking-[0.2em] transition-colors ${
                        active
                          ? 'border-ink-900 text-ink-900'
                          : 'border-ink-900/15 text-ink-600 hover:border-ink-900/50'
                      }`}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Qiymət */}
        <div className="relative">
          <button
            type="button"
            aria-expanded={open === 'price'}
            onClick={() => setOpen(open === 'price' ? null : 'price')}
            className={triggerClass(open === 'price' || priceActive)}
          >
            Qiymət
            {priceActive && countBadge(1)}
            <ChevronDown
              size={13}
              strokeWidth={1.5}
              className={`transition-transform duration-300 ${open === 'price' ? 'rotate-180' : ''}`}
            />
          </button>
          {open === 'price' && (
            <div className={panelClass}>
              <p className={panelTitle}>Qiymət aralığı</p>
              <div className="mt-5 space-y-4">
                <input
                  type="range"
                  min={bounds.priceFloor}
                  max={bounds.priceCeiling}
                  step={5}
                  value={filters.priceMin}
                  aria-label="Minimum qiymət"
                  onChange={(event) =>
                    onFiltersChange({
                      ...filters,
                      priceMin: Math.min(Number(event.target.value), filters.priceMax),
                    })
                  }
                  className="lux-range"
                />
                <input
                  type="range"
                  min={bounds.priceFloor}
                  max={bounds.priceCeiling}
                  step={5}
                  value={filters.priceMax}
                  aria-label="Maksimum qiymət"
                  onChange={(event) =>
                    onFiltersChange({
                      ...filters,
                      priceMax: Math.max(Number(event.target.value), filters.priceMin),
                    })
                  }
                  className="lux-range"
                />
                <p className="text-xs font-light tracking-[0.15em] text-ink-500">
                  {filters.priceMin} ₼ — {filters.priceMax} ₼
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sırala */}
        <label className="ml-auto flex items-center gap-3 text-xs text-ink-500">
          <span className="hidden uppercase tracking-[0.2em] sm:inline">Sırala</span>
          <select
            value={sort}
            onChange={(event) => onSortChange(event.target.value)}
            className="cursor-pointer border border-ink-900/15 bg-linen-50 px-3 py-2 text-[11px] uppercase tracking-[0.15em] text-ink-700 outline-none transition-colors hover:border-ink-900"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  )
}
