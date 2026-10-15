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

const sectionTitle = 'text-[10px] font-medium uppercase tracking-[0.4em] text-ink-400'
const checkboxLabel =
  'flex cursor-pointer items-center gap-3 py-1 text-xs font-light tracking-[0.08em] text-ink-600 transition-colors hover:text-ink-900'
const checkboxInput =
  'h-3 w-3 shrink-0 appearance-none border border-ink-900/30 bg-transparent accent-ink-900 checked:border-ink-900 checked:bg-ink-900'

function toggleList(list, item) {
  return list.includes(item) ? list.filter((entry) => entry !== item) : [...list, item]
}

/**
 * Lüks katalog filtresi — inceltedilmiş, zarif kontroller.
 * Masaüstünde sidebar, mobilde drawer içinde kullanılır.
 */
export function FilterSidebar({ filters, bounds, materials, onChange }) {
  return (
    <div className="space-y-10">
      {/* Kateqoriya */}
      <fieldset>
        <legend className={sectionTitle}>Kateqoriya</legend>
        <div className="mt-4">
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
                className={checkboxInput}
              />
              {category}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Material */}
      <fieldset>
        <legend className={sectionTitle}>Material</legend>
        <div className="mt-4">
          {materials.map((material) => (
            <label key={material} className={checkboxLabel}>
              <input
                type="checkbox"
                checked={filters.materials.includes(material)}
                onChange={() =>
                  onChange({ ...filters, materials: toggleList(filters.materials, material) })
                }
                className={checkboxInput}
              />
              {material}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Ölçü */}
      <fieldset>
        <legend className={sectionTitle}>Ölçü</legend>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {SIZE_OPTIONS.map((size) => {
            const active = filters.sizes.includes(size)
            return (
              <button
                key={size}
                type="button"
                aria-pressed={active}
                onClick={() => onChange({ ...filters, sizes: toggleList(filters.sizes, size) })}
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
      </fieldset>

      {/* Qiymət aralığı — ince lux-range kontrolü */}
      <fieldset>
        <legend className={sectionTitle}>Qiymət</legend>
        <div className="mt-5 space-y-4">
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
              onChange({
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
      </fieldset>
    </div>
  )
}
