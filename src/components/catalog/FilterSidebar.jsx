/** Filtre durumu — CatalogPage tarafından yönetilir.
 * @typedef {Object} FilterState
 * @property {string[]} categories
 * @property {string[]} materials
 * @property {string[]} sizes
 * @property {number} priceMin
 * @property {number} priceMax
 */

/**
 * @typedef {Object} FilterSidebarProps
 * @property {FilterState} filters
 * @property {{priceFloor: number, priceCeiling: number}} bounds
 * @property {string[]} materials
 * @property {(next: FilterState) => void} onChange
 */

const CATEGORY_OPTIONS = [
  'Hoodie',
  'T-Shirt',
  'Pants',
  'Sweatshirt',
  'Longsleeve',
  'Coat',
]

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

const sectionTitle = 'text-[10px] font-medium uppercase tracking-[0.3em] text-ink-400'
const checkboxLabel =
  'flex cursor-pointer items-center gap-2.5 py-1 text-xs tracking-wide text-ink-700 transition-colors hover:text-ink-900'

function toggleList(list, item) {
  return list.includes(item) ? list.filter((entry) => entry !== item) : [...list, item]
}

/**
 * Mikro-Aşama 7: Filtre paneli (kategori, material, beden, fiyat aralığı).
 * Masaüstünde sidebar, mobilde drawer içinde kullanılır.
 */
export function FilterSidebar({ filters, bounds, materials, onChange }) {
  return (
    <div className="space-y-9">
      {/* Kateqoriya */}
      <fieldset>
        <legend className={sectionTitle}>Kateqoriya</legend>
        <div className="mt-3">
          {CATEGORY_OPTIONS.map((category) => (
            <label key={category} className={checkboxLabel}>
              <input
                type="checkbox"
                checked={filters.categories.includes(category)}
                onChange={() =>
                  onChange({
                    ...filters,
                    categories: toggleList(filters.categories, category),
                  })
                }
                className="h-3.5 w-3.5 accent-clay-500"
              />
              {category}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Material */}
      <fieldset>
        <legend className={sectionTitle}>Material</legend>
        <div className="mt-3">
          {materials.map((material) => (
            <label key={material} className={checkboxLabel}>
              <input
                type="checkbox"
                checked={filters.materials.includes(material)}
                onChange={() =>
                  onChange({ ...filters, materials: toggleList(filters.materials, material) })
                }
                className="h-3.5 w-3.5 accent-clay-500"
              />
              {material}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Ölçü */}
      <fieldset>
        <legend className={sectionTitle}>Ölçü</legend>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {SIZE_OPTIONS.map((size) => {
            const active = filters.sizes.includes(size)
            return (
              <button
                key={size}
                type="button"
                aria-pressed={active}
                onClick={() => onChange({ ...filters, sizes: toggleList(filters.sizes, size) })}
                className={`border py-2 text-xs tracking-[0.15em] transition-colors ${
                  active
                    ? 'border-ink-900 bg-ink-900 text-linen-50'
                    : 'border-ink-900/20 text-ink-700 hover:border-ink-900'
                }`}
              >
                {size}
              </button>
            )
          })}
        </div>
      </fieldset>

      {/* Qiymət aralığı */}
      <fieldset>
        <legend className={sectionTitle}>Qiymət</legend>
        <div className="mt-4 space-y-3">
          <input
            type="range"
            min={bounds.priceFloor}
            max={bounds.priceCeiling}
            step={5}
            value={filters.priceMin}
            aria-label="Minimum qiymət"
            onChange={(event) =>
              onChange({
                ...filters,
                priceMin: Math.min(Number(event.target.value), filters.priceMax),
              })
            }
            className="w-full accent-clay-500"
          />
          <input
            type="range"
            min={bounds.priceFloor}
            max={bounds.priceCeiling}
            step={5}
            value={filters.priceMax}
            aria-label="Maksimum qiymət"
            onChange={(event) =>
              onChange({
                ...filters,
                priceMax: Math.max(Number(event.target.value), filters.priceMin),
              })
            }
            className="w-full accent-clay-500"
          />
          <p className="text-xs tracking-wide text-ink-500">
            {filters.priceMin} ₼ — {filters.priceMax} ₼
          </p>
        </div>
      </fieldset>
    </div>
  )
}
