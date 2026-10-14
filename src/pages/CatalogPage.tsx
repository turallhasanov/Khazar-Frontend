import { SlidersHorizontal, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FilterSidebar } from '../components/catalog/FilterSidebar'
import type { FilterBounds, FilterState } from '../components/catalog/FilterSidebar'
import { ProductCard } from '../components/product/ProductCard'
import { mockProducts } from '../data/mockProducts'
import type { Category, Product } from '../types/product'

type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'newest'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'featured', label: 'Önə çıxanlar' },
  { value: 'price-asc', label: 'Qiymət: aşağıdan yuxarı' },
  { value: 'price-desc', label: 'Qiymət: yuxarıdan aşağı' },
  { value: 'newest', label: 'Ən yenilər' },
]

/** Header/Footer linklərindəki ?kateqoriya= dəyərlərinin Category-yə qarşılığı. */
const QUERY_CATEGORY_MAP: Record<string, Category> = {
  hoodie: 'Hoodie',
  't-shirt': 'T-Shirt',
  salvar: 'Pants',
  pants: 'Pants',
  sweatshirt: 'Sweatshirt',
  longsleeve: 'Longsleeve',
  palto: 'Coat',
  coat: 'Coat',
}

const priceFloor = Math.floor(Math.min(...mockProducts.map((p) => p.basePrice)))
const priceCeiling = Math.ceil(Math.max(...mockProducts.map((p) => p.basePrice)))

const MATERIALS = [...new Set(mockProducts.map((p) => p.fabric.material))].sort()

const defaultFilters: FilterState = {
  categories: [],
  materials: [],
  sizes: [],
  priceMin: priceFloor,
  priceMax: priceCeiling,
}

function isDefaultFilters(filters: FilterState): boolean {
  return (
    filters.categories.length === 0 &&
    filters.materials.length === 0 &&
    filters.sizes.length === 0 &&
    filters.priceMin === priceFloor &&
    filters.priceMax === priceCeiling
  )
}

function applyFilters(products: Product[], filters: FilterState): Product[] {
  return products.filter(
    (product) =>
      (filters.categories.length === 0 || filters.categories.includes(product.category)) &&
      (filters.materials.length === 0 ||
        filters.materials.includes(product.fabric.material)) &&
      (filters.sizes.length === 0 ||
        product.sizes.some((size) => filters.sizes.includes(size))) &&
      product.basePrice >= filters.priceMin &&
      product.basePrice <= filters.priceMax,
  )
}

function applySort(products: Product[], sort: SortKey): Product[] {
  const sorted = [...products]
  switch (sort) {
    case 'price-asc':
      return sorted.sort((a, b) => a.basePrice - b.basePrice)
    case 'price-desc':
      return sorted.sort((a, b) => b.basePrice - a.basePrice)
    case 'newest':
      return sorted.sort(
        (a, b) => Number(b.isNew ?? false) - Number(a.isNew ?? false),
      )
    case 'featured':
    default:
      return sorted.sort(
        (a, b) =>
          Number(b.isBestseller ?? false) - Number(a.isBestseller ?? false) ||
          Number(b.isNew ?? false) - Number(a.isNew ?? false),
      )
  }
}

/** Aktiv filtrelerin rozete dönüştürülmesi. */
function buildBadges(
  filters: FilterState,
  clear: (patch: Partial<FilterState>) => void,
) {
  const badges: { key: string; label: string; remove: () => void }[] = []
  filters.categories.forEach((category) =>
    badges.push({
      key: `cat-${category}`,
      label: category,
      remove: () =>
        clear({ categories: filters.categories.filter((c) => c !== category) }),
    }),
  )
  filters.materials.forEach((material) =>
    badges.push({
      key: `mat-${material}`,
      label: material,
      remove: () =>
        clear({ materials: filters.materials.filter((m) => m !== material) }),
    }),
  )
  filters.sizes.forEach((size) =>
    badges.push({
      key: `size-${size}`,
      label: `Ölçü ${size}`,
      remove: () => clear({ sizes: filters.sizes.filter((s) => s !== size) }),
    }),
  )
  if (filters.priceMin !== priceFloor || filters.priceMax !== priceCeiling) {
    badges.push({
      key: 'price',
      label: `${filters.priceMin} ₼ — ${filters.priceMax} ₼`,
      remove: () => clear({ priceMin: priceFloor, priceMax: priceCeiling }),
    })
  }
  return badges
}

/**
 * Mikro-Aşama 7: Katalog səhifəsi — sidebar/modal filtre sistemi, sıralama,
 * aktiv filtre rozeti, məhsul sayı. Yeni mockProducts.ts verisi ilə.
 */
export function CatalogPage() {
  const [searchParams] = useSearchParams()
  const [filters, setFilters] = useState<FilterState>(() => ({
    ...defaultFilters,
    // Header/Footer kateqoriya linklərini filtre ilə aç
    categories: (() => {
      const query = searchParams.get('kateqoriya')
      const mapped = query ? QUERY_CATEGORY_MAP[query] : undefined
      return mapped ? [mapped] : []
    })(),
  }))
  const [sort, setSort] = useState<SortKey>('featured')
  const [drawerOpen, setDrawerOpen] = useState(false)

  const bounds: FilterBounds = useMemo(
    () => ({ priceFloor, priceCeiling }),
    [],
  )

  const visibleProducts = useMemo(
    () => applySort(applyFilters(mockProducts, filters), sort),
    [filters, sort],
  )

  const badges = useMemo(
    () =>
      buildBadges(filters, (patch) => setFilters((current) => ({ ...current, ...patch }))),
    [filters],
  )

  // Mobil drawer açıkken arka plan kaydırmasını kilitle
  useEffect(() => {
    if (!drawerOpen) return undefined
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [drawerOpen])

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-baseline justify-between">
          <h1 className="font-display text-3xl tracking-[0.05em] text-ink-900">Kataloq</h1>
          <p className="text-xs tracking-[0.2em] text-ink-400">
            {visibleProducts.length} MƏHSUL
          </p>
        </div>

        {/* Üst bar: mobil filtre butonu + sıralama */}
        <div className="mt-8 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-2 border border-ink-900/20 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.25em] text-ink-700 transition-colors hover:border-ink-900 md:hidden"
          >
            <SlidersHorizontal size={14} strokeWidth={1.5} />
            Filtre
          </button>
          <label className="ml-auto flex items-center gap-3 text-xs text-ink-500">
            <span className="hidden uppercase tracking-[0.2em] sm:inline">Sırala</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              className="cursor-pointer border border-ink-900/20 bg-linen-50 px-3 py-2 text-xs tracking-wide text-ink-900 outline-none transition-colors hover:border-ink-900"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Aktif filtre rozetleri */}
        {badges.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {badges.map((badge) => (
              <button
                key={badge.key}
                type="button"
                onClick={badge.remove}
                className="flex items-center gap-2 bg-ink-900 px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] text-linen-50 transition-colors hover:bg-clay-600"
              >
                {badge.label}
                <X size={12} strokeWidth={2} />
              </button>
            ))}
            <button
              type="button"
              onClick={() => setFilters(defaultFilters)}
              className="text-[10px] uppercase tracking-[0.2em] text-ink-500 underline-offset-4 transition-colors hover:text-clay-600 hover:underline"
            >
              Hamısını təmizlə
            </button>
          </div>
        )}

        <div className="mt-8 grid gap-10 md:grid-cols-[230px_1fr]">
          {/* Masaüstü sidebar */}
          <aside className="hidden md:block">
            <div className="sticky top-24">
              <FilterSidebar
                filters={filters}
                bounds={bounds}
                materials={MATERIALS}
                onChange={setFilters}
              />
            </div>
          </aside>

          {/* Məhsul grid */}
          {visibleProducts.length > 0 ? (
            <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {visibleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center border border-ink-900/10 py-24 text-center">
              <p className="font-display text-xl text-ink-700">
                Heç bir məhsul tapılmadı
              </p>
              <p className="mt-2 text-sm text-ink-400">
                Filtre parametrlərini dəyişməyi yoxlayın.
              </p>
              <button
                type="button"
                onClick={() => setFilters(defaultFilters)}
                className="mt-6 border border-ink-900 px-6 py-2 text-[10px] uppercase tracking-[0.3em] text-ink-900 transition-colors hover:bg-ink-900 hover:text-linen-50"
              >
                Filtreleri sıfırla
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobil filter drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="Filtre panelini bağla"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-ink-900/40"
          />
          <div className="absolute inset-y-0 left-0 flex w-80 max-w-[85vw] flex-col bg-linen-50 shadow-xl">
            <div className="flex items-center justify-between border-b border-linen-200 px-6 py-4">
              <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-ink-900">
                Filtre
              </span>
              <button
                type="button"
                aria-label="Bağla"
                onClick={() => setDrawerOpen(false)}
                className="p-1 text-ink-500 transition-colors hover:text-ink-900"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <FilterSidebar
                filters={filters}
                bounds={bounds}
                materials={MATERIALS}
                onChange={setFilters}
              />
            </div>
            <div className="border-t border-linen-200 px-6 py-4">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="w-full bg-ink-900 py-3 text-[11px] font-medium uppercase tracking-[0.3em] text-linen-50 transition-colors hover:bg-clay-600"
              >
                {visibleProducts.length} nəticəni göstər
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
