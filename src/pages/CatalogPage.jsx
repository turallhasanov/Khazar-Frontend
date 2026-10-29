import { X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CatalogCategoryTabs } from '../components/catalog/CatalogCategoryTabs'
import { categoryLabel } from '../components/catalog/categoryLabels.js'
import { CatalogFilterBar } from '../components/catalog/CatalogFilterBar'
import { ProductCard } from '../components/product/ProductCard'
import { useProducts } from '../context/ProductsContext'
import { useContentSection } from '../context/SiteContentContext'
import { hideBrokenImage } from '../services/imageFallback.js'
import { responsiveImage } from '../services/responsiveImage.js'

/**
 * ?kateqoriya= aliases that are not a category's slug (e.g. older English links). Slugs themselves come from
 * GET /api/categories, so a category created in the admin panel is linkable without a code change.
 */
const QUERY_CATEGORY_MAP = {
  hoodie: 'Hoodie',
  't-shirt': 'T-Shirt',
  salvar: 'Pants',
  pants: 'Pants',
  sweatshirt: 'Sweatshirt',
  longsleeve: 'Longsleeve',
  palto: 'Coat',
  coat: 'Coat',
}

/** Price slider range derived from the loaded catalog. */
function computeBounds(products) {
  const prices = products.map((p) => p.basePrice)
  return {
    priceFloor: prices.length ? Math.floor(Math.min(...prices)) : 0,
    priceCeiling: prices.length ? Math.ceil(Math.max(...prices)) : 0,
  }
}

function buildDefaultFilters({ priceFloor, priceCeiling }) {
  return {
    categories: [],
    materials: [],
    sizes: [],
    colors: [],
    priceMin: priceFloor,
    priceMax: priceCeiling,
  }
}

function applyFilters(products, filters) {
  return products.filter(
    (product) =>
      (filters.categories.length === 0 || filters.categories.includes(product.category)) &&
      (filters.materials.length === 0 ||
        filters.materials.includes(product.fabric.material)) &&
      (filters.sizes.length === 0 ||
        product.sizes.some((size) => filters.sizes.includes(size))) &&
      (filters.colors.length === 0 ||
        product.colors.some((color) => filters.colors.includes(color.name))) &&
      product.basePrice >= filters.priceMin &&
      product.basePrice <= filters.priceMax,
  )
}

function applySort(products, sort) {
  const sorted = [...products]
  switch (sort) {
    case 'price-asc':
      return sorted.sort((a, b) => a.basePrice - b.basePrice)
    case 'price-desc':
      return sorted.sort((a, b) => b.basePrice - a.basePrice)
    case 'featured':
    default:
      // Stable sort: bestsellers first, the API's order otherwise.
      return sorted.sort((a, b) => Number(b.isBestseller ?? false) - Number(a.isBestseller ?? false))
  }
}

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

/** Sizes the catalog actually carries, in apparel order (unknown sizes last), for the size filter. */
function collectSizes(products) {
  const present = new Set(products.flatMap((product) => product.sizes))
  const rank = (size) => (SIZE_ORDER.includes(size) ? SIZE_ORDER.indexOf(size) : SIZE_ORDER.length)
  return [...present].sort((a, b) => rank(a) - rank(b))
}

/** Unique colors across the catalog, in first-seen order, for the color filter. */
function collectColors(products) {
  const byName = new Map()
  products.forEach((product) =>
    product.colors.forEach((color) => byName.has(color.name) || byName.set(color.name, color)),
  )
  return [...byName.values()]
}

/** Aktif filtrelerin rozete dönüştürülmesi (kateqoriya tablarda göründüyü üçün burada yoxdur). */
function buildBadges(filters, clear, { priceFloor, priceCeiling }) {
  const badges = []
  filters.materials.forEach((material) =>
    badges.push({
      key: `mat-${material}`,
      label: material,
      remove: () => clear({ materials: filters.materials.filter((m) => m !== material) }),
    }),
  )
  filters.sizes.forEach((size) =>
    badges.push({
      key: `size-${size}`,
      label: `Ölçü ${size}`,
      remove: () => clear({ sizes: filters.sizes.filter((s) => s !== size) }),
    }),
  )
  filters.colors.forEach((color) =>
    badges.push({
      key: `color-${color}`,
      label: color,
      remove: () => clear({ colors: filters.colors.filter((c) => c !== color) }),
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
 * Editoryal katalog — sinematik kapakdan sonra kateqoriya tabları, filtr şeridi və
 * məhsul sayına uyğunlaşan grid.
 * Mounted only after the catalog has loaded, so filter state starts from the real price bounds.
 */
function CatalogBrowser({ products, categories }) {
  const [searchParams] = useSearchParams()
  const bounds = useMemo(() => computeBounds(products), [products])
  const materials = useMemo(
    () => [...new Set(products.map((p) => p.fabric.material))].sort(),
    [products],
  )
  const colors = useMemo(() => collectColors(products), [products])
  const sizes = useMemo(() => collectSizes(products), [products])
  const defaultFilters = useMemo(() => buildDefaultFilters(bounds), [bounds])
  const [filters, setFilters] = useState(() => ({
    ...defaultFilters,
    // Header/Footer kateqoriya linklərini filtre ilə aç
    categories: (() => {
      const query = searchParams.get('kateqoriya')
      if (!query) return []
      const mapped = categories.find((category) => category.slug === query)?.name ?? QUERY_CATEGORY_MAP[query]
      return mapped ? [mapped] : []
    })(),
  }))
  const [sort, setSort] = useState('featured')

  const visibleProducts = useMemo(
    () => applySort(applyFilters(products, filters), sort),
    [products, filters, sort],
  )

  // Tab counts honour every other active filter, so a tab never promises products that are filtered out.
  // Only categories with products get a tab, in the admin's sort order; one the API did not list goes last.
  const categoryTabs = useMemo(() => {
    const pool = applyFilters(products, { ...filters, categories: [] })
    const byName = new Map(categories.map((category, index) => [category.name, { ...category, index }]))
    const present = [...new Set(products.map((p) => p.category))]
    const rank = (name) => byName.get(name)?.index ?? categories.length
    return {
      total: pool.length,
      items: present
        .sort((a, b) => rank(a) - rank(b))
        .map((category) => ({
          value: category,
          label: byName.get(category)?.label ?? categoryLabel(category),
          count: pool.filter((p) => p.category === category).length,
        })),
    }
  }, [products, categories, filters])
  const activeCategory = filters.categories.length === 1 ? filters.categories[0] : null

  const badges = useMemo(
    () =>
      buildBadges(
        filters,
        (patch) => setFilters((current) => ({ ...current, ...patch })),
        bounds,
      ),
    [filters, bounds],
  )

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
      <h2 className="sr-only">Məhsullar</h2>

      {/* 2. Kolleksiya naviqasiyası */}
      <div className="pt-12 md:pt-16">
        <CatalogCategoryTabs
          categories={categoryTabs.items}
          active={activeCategory}
          total={categoryTabs.total}
          onChange={(category) =>
            setFilters((current) => ({ ...current, categories: category ? [category] : [] }))
          }
        />
      </div>

      {/* 3. Filtr şeridi — tabların xəttindən asılır (öz üst xətti yoxdur) */}
      <div>
        <CatalogFilterBar
          filters={filters}
          bounds={bounds}
          materials={materials}
          sizes={sizes}
          colors={colors}
          sort={sort}
          resultCount={visibleProducts.length}
          onSortChange={setSort}
          onFiltersChange={setFilters}
          onClear={() => setFilters({ ...defaultFilters, categories: filters.categories })}
        />
      </div>

      {/* 4. Aktif filtre rozetleri + məhsul sayı (sayı filtr olmasa da görünür) */}
      <div className="mb-10 mt-4 flex min-h-6 flex-wrap items-center gap-1.5">
        {badges.length > 0 && (
          <>
            {badges.map((badge) => (
              <button
                key={badge.key}
                type="button"
                onClick={badge.remove}
                className="flex h-6 items-center gap-1.5 rounded-full border border-linen-200 bg-linen-100/60 pl-3 pr-2 text-[9px] uppercase tracking-[0.18em] text-ink-700 transition-colors hover:border-ink-400 hover:text-ink-900"
              >
                {badge.label}
                <X size={10} strokeWidth={1.75} className="text-ink-400" />
              </button>
            ))}
            <button
              type="button"
              onClick={() => setFilters({ ...defaultFilters, categories: filters.categories })}
              className="ml-1.5 text-[9px] uppercase tracking-[0.2em] text-ink-400 underline-offset-4 transition-colors hover:text-ink-900 hover:underline"
            >
              Hamısını təmizlə
            </button>
          </>
        )}
        <span className="ml-auto text-[10px] uppercase tracking-[0.25em] text-ink-400">
          {visibleProducts.length} məhsul
        </span>
      </div>

      {/* 5. Adaptiv grid — sütun sayı məhsul sayına uyğunlaşır */}
      {visibleProducts.length > 0 ? (
        <div className={`mx-auto grid max-w-7xl gap-x-10 gap-y-16 ${gridLayout(visibleProducts.length)}`}>
          {visibleProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center border border-ink-900/10 py-28 text-center">
          <p className="font-display text-2xl font-light text-ink-700">
            Heç bir məhsul tapılmadı
          </p>
          <p className="mt-2 text-sm font-light text-ink-400">
            Filtre parametrlərini dəyişməyi yoxlayın.
          </p>
          <button
            type="button"
            onClick={() => setFilters(defaultFilters)}
            className="mt-8 border border-ink-900 px-8 py-3 text-[10px] uppercase tracking-[0.3em] text-ink-900 transition-colors hover:bg-ink-900 hover:text-linen-50"
          >
            Filtreleri sıfırla
          </button>
        </div>
      )}
    </div>
  )
}

/**
 * Editorial grid: at most three generous columns. One or two results get a narrower centered frame so they
 * stay large instead of leaving the right side of a 3-column row empty.
 */
function gridLayout(count) {
  if (count === 1) return 'max-w-md grid-cols-1'
  if (count === 2) return 'max-w-4xl grid-cols-1 md:grid-cols-2'
  return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
}

/** Shown in place of the grid while the catalog loads or when the API is unreachable. */
function CatalogStatus({ status, onRetry }) {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
      <div className="mt-10 flex flex-col items-center justify-center border border-ink-900/10 py-28 text-center">
        {status === 'loading' ? (
          <p className="text-[10px] uppercase tracking-[0.35em] text-ink-400">Kataloq yüklənir…</p>
        ) : (
          <>
            <p className="font-display text-2xl font-light text-ink-700">Kataloq yüklənmədi</p>
            <p className="mt-2 text-sm font-light text-ink-400">
              Serverə qoşulmaq mümkün olmadı. Bir az sonra yenidən yoxlayın.
            </p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-8 border border-ink-900 px-8 py-3 text-[10px] uppercase tracking-[0.3em] text-ink-900 transition-colors hover:bg-ink-900 hover:text-linen-50"
            >
              Yenidən yoxla
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export function CatalogPage() {
  const { products, categories, status, reload } = useProducts()
  const cover = useContentSection('catalog')
  const coverImage = responsiveImage(cover?.coverImageUrl)

  return (
    <main className="flex-1">
      {/* 1. Editoryal kapak — tam genişlik sinematik başlık ("catalog" bölməsi, admin panelindən).
          Məzmun yüklənənədək yalnız tünd zəmin görünür ki, səhifə tullanmasın. */}
      <section className="relative h-[420px] overflow-hidden bg-ink-900 md:h-[540px]">
        {coverImage.src && (
          // Crop from the upper third: the face then sits above the centred title instead of behind it.
          <img
            {...coverImage}
            onError={hideBrokenImage}
            sizes="100vw"
            alt={cover.coverImageAlt}
            className="h-full w-full object-cover object-[center_30%]"
          />
        )}
        <div className="absolute inset-0 bg-ink-900/40" />
        {cover && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <p className="text-[10px] uppercase tracking-[0.5em] text-linen-200/80">{cover.eyebrow}</p>
            <h1 className="mt-5 font-display text-4xl font-light tracking-[0.05em] text-linen-50 sm:text-5xl md:text-7xl">
              {cover.title}
            </h1>
            {cover.subtitle && (
              <p className="mt-4 font-display text-lg italic tracking-[0.2em] text-clay-400 md:text-xl">{cover.subtitle}</p>
            )}
            {cover.description && (
              <p className="mt-5 max-w-md text-sm font-light leading-relaxed text-linen-100/80">{cover.description}</p>
            )}
          </div>
        )}
      </section>

      {status === 'ready' ? (
        <CatalogBrowser products={products} categories={categories} />
      ) : (
        <CatalogStatus status={status} onRetry={reload} />
      )}
    </main>
  )
}
