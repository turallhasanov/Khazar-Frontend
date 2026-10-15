import { ArrowUpRight, Search, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { mockProducts } from '../../data/mockProducts'
import { formatPrice } from '../../services/formatPrice'

/** Boş sorguda gösterilen trend arama önerileri. */
const TREND_SEARCHES = ['Hoodie', 'Oversize', 'Pambıq', 'Palto']

/** Boş sorguda gösterilen populyar kateqoriyalar (katalog filtre linki). */
const POPULAR_CATEGORIES = [
  { label: 'Hoodie', query: 'hoodie' },
  { label: 'T-Shirt', query: 't-shirt' },
  { label: 'Şalvar', query: 'salvar' },
  { label: 'Sweatshirt', query: 'sweatshirt' },
  { label: 'Longsleeve', query: 'longsleeve' },
  { label: 'Palto', query: 'palto' },
]

const MAX_RESULTS = 8

/** Ürün alanlarında küçük harfli içerme araması. */
function searchProducts(query) {
  const needle = query.trim().toLowerCase()
  if (!needle) return []
  return mockProducts
    .filter((product) =>
      [
        product.name,
        product.category,
        product.fabric.material,
        product.fabric.weave ?? '',
        product.description,
        ...product.colors.map((color) => color.name),
      ]
        .join(' ')
        .toLowerCase()
        .includes(needle),
    )
    .slice(0, MAX_RESULTS)
}

/**
 * Editoryal tam ekran arama paneli.
 * - ESC ile kapanma, açıkken arka plan kaydırması kilitli, blur perdesi
 * - Boş sorgu: trend aramalar + populyar kateqoriyalar
 * - Yazdıqca canlı ürün nəticələri (görsel, ad, fiyat)
 */
export function SearchModal({ open, onClose }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  const navigate = useNavigate()

  /** Sorguyu sıfırlayarak kapatır (ESC, perde, buton ve ürün seçimi). */
  const close = useCallback(() => {
    setQuery('')
    onClose()
  }, [onClose])

  // ESC ile kapatma + açılışta kaydırma kilidi ve odağı inputa verme
  useEffect(() => {
    if (!open) return undefined
    const handleKey = (event) => {
      if (event.key === 'Escape') close()
    }
    document.addEventListener('keydown', handleKey)
    document.documentElement.style.overflow = 'hidden'
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 50)
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.documentElement.style.overflow = ''
      window.clearTimeout(focusTimer)
    }
  }, [open, close])

  const results = useMemo(() => searchProducts(query), [query])
  const showDiscovery = query.trim().length === 0

  const goToProduct = (slug) => {
    close()
    navigate(`/mehsul/${slug}`)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Axtarış">
      {/* Bulanık perde */}
      <button
        type="button"
        aria-label="Axtarışı bağla"
        onClick={close}
        className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm"
      />

      {/* Panel */}
      <div className="absolute inset-x-0 top-0 max-h-full overflow-y-auto bg-linen-50 shadow-2xl">
        <div className="mx-auto max-w-3xl px-6 py-10 md:py-14">
          {/* Üst satır: etiket + kapatma */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.35em] text-ink-400">
              <Search size={14} strokeWidth={1.5} />
              Axtarış
            </span>
            <button
              type="button"
              aria-label="Bağla"
              onClick={close}
              className="p-1 text-ink-500 transition-colors hover:text-ink-900"
            >
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>

          {/* Editoryal arama girdisi */}
          <div className="mt-8 border-b border-ink-900/20 pb-4 transition-colors focus-within:border-ink-900">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nə axtarırsınız?"
              aria-label="Axtarış sorğusu"
              className="w-full bg-transparent font-display text-3xl font-light tracking-[0.02em] text-ink-900 outline-none placeholder:text-ink-300 md:text-4xl"
            />
          </div>

          {showDiscovery ? (
            /* Keşif modu: trend aramalar + populyar kateqoriyalar */
            <div className="mt-10 grid gap-12 md:grid-cols-2">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-ink-400">
                  Trend axtarışlar
                </p>
                <div className="mt-5 flex flex-wrap gap-2.5">
                  {TREND_SEARCHES.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setQuery(term)}
                      className="border border-ink-900/15 px-4 py-2 text-xs font-light tracking-[0.1em] text-ink-700 transition-colors hover:border-ink-900 hover:text-ink-900"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-ink-400">
                  Populyar kateqoriyalar
                </p>
                <ul className="mt-5 divide-y divide-linen-200 border-y border-linen-200">
                  {POPULAR_CATEGORIES.map((category) => (
                    <li key={category.query}>
                      <Link
                        to={`/katalog?kateqoriya=${category.query}`}
                        onClick={close}
                        className="group flex items-center justify-between py-3 text-sm font-light tracking-[0.08em] text-ink-700 transition-colors hover:text-clay-600"
                      >
                        {category.label}
                        <ArrowUpRight
                          size={14}
                          strokeWidth={1.5}
                          className="text-ink-400 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-clay-600"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            /* Canlı sonuçlar */
            <div className="mt-8">
              <p className="text-[10px] uppercase tracking-[0.3em] text-ink-400">
                {results.length > 0 ? `${results.length} nəticə` : 'Nəticə tapılmadı'}
              </p>
              {results.length > 0 ? (
                <ul className="mt-5 divide-y divide-linen-200 border-y border-linen-200">
                  {results.map((product) => (
                    <li key={product.id}>
                      <button
                        type="button"
                        onClick={() => goToProduct(product.slug)}
                        className="group flex w-full items-center gap-5 py-4 text-left"
                      >
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          loading="lazy"
                          className="h-20 w-16 shrink-0 bg-linen-100 object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-display text-lg font-light tracking-[0.02em] text-ink-900 transition-colors group-hover:text-clay-600">
                            {product.name}
                          </p>
                          <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-ink-400">
                            {product.category} · {product.fabric.material}
                          </p>
                        </div>
                        <span className="text-sm font-light tracking-[0.05em] text-ink-900">
                          {formatPrice(product.basePrice)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-5 text-sm font-light text-ink-500">
                  &ldquo;{query.trim()}&rdquo; üçün nəticə yoxdur — fərqli açar söz yoxlayın.
                </p>
              )}
            </div>
          )}

          <p className="mt-10 text-[10px] uppercase tracking-[0.3em] text-ink-300">
            ESC — Bağla
          </p>
        </div>
      </div>
    </div>
  )
}
