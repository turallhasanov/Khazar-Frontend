import { Check, ChevronDown, SlidersHorizontal, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

// Only sorts the API can back: "featured" reads isBestseller (Product.IsFeatured). There is no creation date
// on the list payload, so a "newest" sort would silently do nothing and is not offered.
const SORT_OPTIONS = [
  { value: 'featured', label: 'Önə çıxanlar' },
  { value: 'price-asc', label: 'Qiymət: artan' },
  { value: 'price-desc', label: 'Qiymət: azalan' },
]

// Fixed h-9 on every trigger and on the sort select keeps the whole row on one vertical line, badge or not.
const barButton =
  'flex h-9 items-center gap-2 rounded-full border bg-linen-50 px-4 text-[10px] font-medium uppercase tracking-[0.25em] transition-colors duration-300'
const panelClass =
  'absolute left-0 top-full z-40 mt-2 w-64 animate-fade-up rounded-sm border border-linen-200 bg-linen-50 p-5 shadow-lg shadow-ink-900/5'
const sectionTitle = 'text-[10px] font-medium uppercase tracking-[0.35em] text-ink-400'
const checkboxLabel =
  'flex cursor-pointer items-center gap-3 py-1.5 text-xs font-light tracking-[0.08em] text-ink-600 transition-colors hover:text-ink-900'
const checkboxInput =
  'h-3 w-3 shrink-0 appearance-none rounded-[2px] border border-ink-900/30 bg-transparent transition-colors checked:border-ink-900 checked:bg-ink-900'

function toggleList(list, item) {
  return list.includes(item) ? list.filter((entry) => entry !== item) : [...list, item]
}

function CountBadge({ count }) {
  if (!count) return null
  return (
    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-clay-600 px-1 text-[9px] font-semibold leading-none text-linen-50">
      {count}
    </span>
  )
}

/* ---- Filter option lists — shared by the desktop popovers and the mobile sheet ---- */

function MaterialOptions({ filters, materials, onFiltersChange }) {
  return (
    <div>
      {materials.map((material) => (
        <label key={material} className={checkboxLabel}>
          <input
            type="checkbox"
            checked={filters.materials.includes(material)}
            onChange={() =>
              onFiltersChange({ ...filters, materials: toggleList(filters.materials, material) })
            }
            className={checkboxInput}
          />
          {material}
        </label>
      ))}
    </div>
  )
}

function SizeOptions({ filters, sizes, onFiltersChange }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {sizes.map((size) => {
        const active = filters.sizes.includes(size)
        return (
          <button
            key={size}
            type="button"
            aria-pressed={active}
            onClick={() => onFiltersChange({ ...filters, sizes: toggleList(filters.sizes, size) })}
            className={`h-9 rounded-sm border text-[11px] font-light tracking-[0.2em] transition-colors duration-300 ${
              active
                ? 'border-ink-900 bg-ink-900 text-linen-50'
                : 'border-linen-200 text-ink-600 hover:border-ink-400 hover:text-ink-900'
            }`}
          >
            {size}
          </button>
        )
      })}
    </div>
  )
}

function ColorOptions({ filters, colors, onFiltersChange }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-1">
      {colors.map((color) => {
        const active = filters.colors.includes(color.name)
        return (
          <button
            key={color.name}
            type="button"
            aria-pressed={active}
            onClick={() => onFiltersChange({ ...filters, colors: toggleList(filters.colors, color.name) })}
            className={`flex items-center gap-2.5 py-1.5 text-left text-xs font-light tracking-[0.06em] transition-colors ${
              active ? 'text-ink-900' : 'text-ink-600 hover:text-ink-900'
            }`}
          >
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ring-1 ring-offset-2 ring-offset-linen-50 transition-shadow ${
                active ? 'ring-ink-900' : 'ring-ink-900/15'
              }`}
              style={{ backgroundColor: color.hex }}
            >
              {active && <Check size={9} strokeWidth={2.5} className="text-linen-50 mix-blend-difference" />}
            </span>
            {color.name}
          </button>
        )
      })}
    </div>
  )
}

function PriceOptions({ filters, bounds, onFiltersChange }) {
  return (
    <div className="space-y-4">
      <input
        type="range"
        min={bounds.priceFloor}
        max={bounds.priceCeiling}
        step={5}
        value={filters.priceMin}
        aria-label="Minimum qiymət"
        onChange={(event) =>
          onFiltersChange({ ...filters, priceMin: Math.min(Number(event.target.value), filters.priceMax) })
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
          onFiltersChange({ ...filters, priceMax: Math.max(Number(event.target.value), filters.priceMin) })
        }
        className="lux-range"
      />
      <p className="text-xs font-light tabular-nums tracking-[0.15em] text-ink-500">
        {filters.priceMin} ₼ — {filters.priceMax} ₼
      </p>
    </div>
  )
}

function SortSelect({ sort, onSortChange }) {
  return (
    <label className="flex items-center gap-3">
      <span className="hidden text-[10px] uppercase tracking-[0.3em] text-ink-400 lg:inline">Sırala</span>
      <span className="relative flex items-center">
        <select
          value={sort}
          aria-label="Sıralama"
          onChange={(event) => onSortChange(event.target.value)}
          className="h-9 cursor-pointer appearance-none rounded-full border border-linen-200 bg-linen-50 pl-4 pr-9 text-[10px] font-medium uppercase tracking-[0.2em] text-ink-700 outline-none transition-colors duration-300 hover:border-ink-400 focus-visible:border-ink-400"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={13}
          strokeWidth={1.5}
          aria-hidden="true"
          className="pointer-events-none absolute right-3.5 text-ink-500"
        />
      </span>
    </label>
  )
}

/** Mobile bottom sheet with every filter stacked; the catalog behind it updates live. */
function FilterSheet({ open, onClose, resultCount, onClear, children }) {
  useEffect(() => {
    if (!open) return undefined
    document.documentElement.style.overflow = 'hidden'
    const onKey = (event) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      document.documentElement.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Filtrlər">
      <button
        type="button"
        aria-label="Filtrləri bağla"
        onClick={onClose}
        className="absolute inset-0 animate-fade-in bg-ink-900/40"
      />
      <div className="absolute inset-x-0 bottom-0 flex max-h-[85svh] animate-sheet-up flex-col rounded-t-xl bg-linen-50">
        <div className="flex items-center justify-between border-b border-linen-200 px-5 py-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.35em] text-ink-900">Filtrlər</p>
          <button
            type="button"
            aria-label="Bağla"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-linen-100 hover:text-ink-900"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>
        <div className="flex-1 space-y-8 overflow-y-auto overscroll-contain px-5 py-6">{children}</div>
        <div className="flex items-center gap-3 border-t border-linen-200 px-5 py-4">
          <button
            type="button"
            onClick={onClear}
            className="h-11 px-2 text-[10px] uppercase tracking-[0.25em] text-ink-500 underline-offset-4 hover:text-ink-900 hover:underline"
          >
            Təmizlə
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-11 flex-1 bg-ink-900 text-[10px] font-medium uppercase tracking-[0.3em] text-linen-50 transition-colors hover:bg-ink-700"
          >
            {resultCount} məhsulu göstər
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Katalog filtr şeridi.
 * Masaüstü: Material / Ölçü / Rəng / Qiymət açılan panelləri + sıralama, bir xətt üzərində.
 * Mobil: "Filtrlər" düyməsi aşağıdan açılan paneli açır; sıralama yanında qalır.
 * Kateqoriyalar ayrıca CatalogCategoryTabs-dadır.
 */
export function CatalogFilterBar({
  filters,
  bounds,
  materials,
  sizes,
  colors,
  sort,
  resultCount,
  onSortChange,
  onFiltersChange,
  onClear,
}) {
  const [open, setOpen] = useState(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const close = () => setOpen(null)
  // Stable so the sheet's scroll-lock effect does not re-run on every render.
  const closeSheet = useCallback(() => setSheetOpen(false), [])

  // Escape closes a desktop popover.
  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => event.key === 'Escape' && setOpen(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const priceActive = filters.priceMin !== bounds.priceFloor || filters.priceMax !== bounds.priceCeiling
  const activeCount =
    filters.materials.length + filters.sizes.length + filters.colors.length + (priceActive ? 1 : 0)
  const shared = { filters, onFiltersChange }

  const sections = [
    {
      id: 'material',
      label: 'Material',
      count: filters.materials.length,
      width: 'w-72',
      content: <MaterialOptions {...shared} materials={materials} />,
    },
    {
      id: 'size',
      label: 'Ölçü',
      count: filters.sizes.length,
      content: <SizeOptions {...shared} sizes={sizes} />,
    },
    {
      id: 'color',
      label: 'Rəng',
      count: filters.colors.length,
      width: 'w-80',
      content: <ColorOptions {...shared} colors={colors} />,
    },
    {
      id: 'price',
      label: 'Qiymət',
      count: priceActive ? 1 : 0,
      content: <PriceOptions {...shared} bounds={bounds} />,
    },
  ]

  return (
    // No top border: the category tabs above already draw the line this bar hangs from.
    <div className="relative border-b border-linen-200 py-4">
      {open && (
        <button
          type="button"
          aria-label="Filtr panelini bağla"
          tabIndex={-1}
          onClick={close}
          className="fixed inset-0 z-30 cursor-default"
        />
      )}

      <div className="flex items-center gap-2.5">
        {/* Mobil: tək düymə + panel */}
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className={`${barButton} md:hidden ${activeCount ? 'border-ink-400 text-ink-900' : 'border-linen-200 text-ink-700'}`}
        >
          <SlidersHorizontal size={13} strokeWidth={1.5} />
          Filtrlər
          <CountBadge count={activeCount} />
        </button>

        {/* Masaüstü: açılan panellər */}
        <span className="mr-2 hidden text-[10px] uppercase tracking-[0.3em] text-ink-400 lg:block">Filtr</span>
        {sections.map((section) => {
          const isOpen = open === section.id
          return (
            <div key={section.id} className="relative hidden md:block">
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : section.id)}
                className={`${barButton} ${
                  isOpen || section.count
                    ? 'border-ink-400 text-ink-900'
                    : 'border-linen-200 text-ink-600 hover:border-ink-400 hover:text-ink-900'
                }`}
              >
                {section.label}
                <CountBadge count={section.count} />
                <ChevronDown
                  size={13}
                  strokeWidth={1.5}
                  className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {isOpen && (
                <div className={`${panelClass} ${section.width ?? ''}`}>
                  <p className={sectionTitle}>{section.label}</p>
                  <div className="mt-4">{section.content}</div>
                </div>
              )}
            </div>
          )
        })}

        <div className="ml-auto">
          <SortSelect sort={sort} onSortChange={onSortChange} />
        </div>
      </div>

      <FilterSheet
        open={sheetOpen}
        onClose={closeSheet}
        resultCount={resultCount}
        onClear={onClear}
      >
        {sections.map((section) => (
          <section key={section.id}>
            <p className={sectionTitle}>{section.label}</p>
            <div className="mt-4">{section.content}</div>
          </section>
        ))}
      </FilterSheet>
    </div>
  )
}
