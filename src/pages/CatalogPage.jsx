import { X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CatalogFilterBar } from '../components/catalog/CatalogFilterBar'
import { ProductCard } from '../components/product/ProductCard'
import { useProducts } from '../context/ProductsContext'
import { hideBrokenImage } from '../services/imageFallback.js'

/** Header/Footer linklərindəki ?kateqoriya= dəyərlərinin kateqoriya adına qarşılığı. */
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

/** Beige knit on a warm studio wall (Unsplash License) — full-width cover, served at the width the screen needs. */
const COVER_PHOTO = 'https://images.unsplash.com/photo-1759229874914-c1ffdb3ebd0c?auto=format&fit=crop&q=80'
const COVER_IMAGE = `${COVER_PHOTO}&w=1600`
const COVER_SRCSET = [800, 1200, 1600, 2400].map((width) => `${COVER_PHOTO}&w=${width} ${width}w`).join(', ')

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
    case 'newest':
      return sorted.sort((a, b) => Number(b.isNew ?? false) - Number(a.isNew ?? false))
    case 'featured':
    default:
      return sorted.sort(
        (a, b) =>
          Number(b.isBestseller ?? false) - Number(a.isBestseller ?? false) ||
          Number(b.isNew ?? false) - Number(a.isNew ?? false),
      )
  }
}

/** Aktif filtrelerin rozete dönüştürülmesi. */
function buildBadges(filters, clear, { priceFloor, priceCeiling }) {
  const badges = []
  filters.categories.forEach((category) =>
    badges.push({
      key: `cat-${category}`,
      label: category,
      remove: () => clear({ categories: filters.categories.filter((c) => c !== category) }),
    }),
  )
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
 * Radikal editoryal katalog — sidebar'sız tam genişlik düzen:
 * üstte sinematik kapak başlığı, altında yatay filtre şeridi ve
 * ilk ürünün iki kolon kapladığı asimetrik dergi grid'i.
 * Mounted only after the catalog has loaded, so filter state starts from the real price bounds.
 */
function CatalogBrowser({ products }) {
  const [searchParams] = useSearchParams()
  const bounds = useMemo(() => computeBounds(products), [products])
  const materials = useMemo(
    () => [...new Set(products.map((p) => p.fabric.material))].sort(),
    [products],
  )
  const defaultFilters = useMemo(() => buildDefaultFilters(bounds), [bounds])
  const [filters, setFilters] = useState(() => ({
    ...defaultFilters,
    // Header/Footer kateqoriya linklərini filtre ilə aç
    categories: (() => {
      const query = searchParams.get('kateqoriya')
      const mapped = query ? QUERY_CATEGORY_MAP[query] : undefined
      return mapped ? [mapped] : []
    })(),
  }))
  const [sort, setSort] = useState('featured')

  const visibleProducts = useMemo(
    () => applySort(applyFilters(products, filters), sort),
    [products, filters, sort],
  )

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
    <div className="mx-auto max-w-[1440px] px-6 pb-20">
      {/* 2. Yatay filtre şeridi */}
      <div className="mt-2">
        <CatalogFilterBar
          filters={filters}
          bounds={bounds}
          materials={materials}
          sort={sort}
          onSortChange={setSort}
          onFiltersChange={setFilters}
        />
      </div>

      {/* 3. Aktif filtre rozetleri */}
      {badges.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {badges.map((badge) => (
            <button
              key={badge.key}
              type="button"
              onClick={badge.remove}
              className="flex items-center gap-2 border border-ink-900/20 px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] text-ink-700 transition-colors hover:border-clay-600 hover:text-clay-600"
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
          <span className="ml-auto text-[10px] uppercase tracking-[0.25em] text-ink-400">
            {visibleProducts.length} məhsul
          </span>
        </div>
      )}

      {/* 4. Asimetrik tam genişlik grid — ilk ürün 2 kolon */}
      {visibleProducts.length > 0 ? (
        <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-16 md:gap-x-8 lg:grid-cols-3 xl:grid-cols-4">
          {visibleProducts.map((product, index) => (
            <div key={product.id} className={index === 0 ? 'col-span-2' : ''}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-10 flex flex-col items-center justify-center border border-ink-900/10 py-28 text-center">
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

/** Shown in place of the grid while the catalog loads or when the API is unreachable. */
function CatalogStatus({ status, onRetry }) {
  return (
    <div className="mx-auto max-w-[1440px] px-6 pb-20">
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
  const { products, status, reload } = useProducts()

  return (
    <main className="flex-1">
      {/* 1. Editoryal kapak — tam genişlik sinematik başlık */}
      <section className="relative h-[420px] overflow-hidden md:h-[540px]">
        {/* Crop from the upper third: the face then sits above the centred title instead of behind it. */}
        <img
          src={COVER_IMAGE}
          onError={hideBrokenImage}
          srcSet={COVER_SRCSET}
          sizes="100vw"
          alt="Bej trikotaj sviter geyinmiş model — Khazar kolleksiyası"
          className="h-full w-full object-cover object-[center_30%]"
        />
        <div className="absolute inset-0 bg-ink-900/40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <p className="text-[10px] uppercase tracking-[0.5em] text-linen-200/80">
            Khazar — Kataloq
          </p>
          <h1 className="mt-5 font-display text-4xl font-light tracking-[0.05em] text-linen-50 sm:text-5xl md:text-7xl">
            KOLLEKSİYA &rsquo;26
          </h1>
          <p className="mt-4 font-display text-lg italic tracking-[0.2em] text-clay-400 md:text-xl">
            Zamansız siluetlər
          </p>
          <p className="mt-5 max-w-md text-sm font-light leading-relaxed text-linen-100/80">
            Hər parça limited seriya, hər siluet illərlə geyiləcək şəkildə
            qurulub — az, amma daha yaxşı.
          </p>
        </div>
      </section>

      {status === 'ready' ? (
        <CatalogBrowser products={products} />
      ) : (
        <CatalogStatus status={status} onRetry={reload} />
      )}
    </main>
  )
}
