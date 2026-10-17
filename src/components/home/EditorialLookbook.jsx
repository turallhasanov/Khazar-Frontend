import { ArrowRight, Plus, ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useEditorial } from '../../context/EditorialContext'
import { mockProducts } from '../../data/mockProducts'
import { formatPrice } from '../../services/formatPrice'

/**
 * Ana səhifə zənginləşdirməsi — Editoryal Lookbook.
 * Asimetrik 3'lü grid: orta kart aşağı kayar, yan kartlar farklı en/oranlarda.
 * Shoppable hotspots: görsel üzerindeki noktaya tıklayınca ürün popover'ı açılır
 * (ad, fiyat, hızlı sepete ekle). CMS JSON'daki `look.hotspots` verisinden beslenir;
 * eski localStorage içeriklerinde alan yoksa boş dizi ile güvenli devam eder.
 */

/** Ürünün stokta olan ilk ölçüsünü döndürür (yoksa null). */
function firstInStockSize(product) {
  return product.sizes.find((size) => (product.stock[size] ?? 0) > 0) ?? null
}

function LookHotspot({ hotspot, open, onToggle, onClose }) {
  const { addToCart, openCart } = useCart()
  const product = mockProducts.find((entry) => entry.slug === hotspot.productSlug)
  const quickSize = product ? firstInStockSize(product) : null

  const quickAdd = () => {
    if (!product || !quickSize) return
    addToCart(product, product.colors[0], quickSize)
    onClose()
    openCart()
  }

  return (
    <>
      {/* Nokta */}
      <button
        type="button"
        aria-label={product ? `${product.name} məhsulunu göstər` : 'Məhsul nöqtəsi'}
        aria-expanded={open}
        onClick={(event) => {
          event.stopPropagation()
          onToggle()
        }}
        className={`absolute z-10 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border transition-all duration-300 ${
          open
            ? 'border-clay-600 bg-clay-600 text-linen-50'
            : 'border-ink-900/30 bg-linen-50/90 text-ink-900 backdrop-blur-sm hover:scale-110 hover:border-ink-900'
        }`}
      >
        <Plus size={14} strokeWidth={1.5} className={open ? 'rotate-45 transition-transform duration-300' : 'transition-transform duration-300'} />
      </button>

      {/* Popover — ürün bilgisi + hızlı sepete ekle */}
      {open && product && (
        <div
          role="dialog"
          aria-label={product.name}
          onClick={(event) => event.stopPropagation()}
          className="absolute left-1/2 top-full z-20 mt-3 w-56 -translate-x-1/2 border border-linen-200 bg-linen-50 p-4 shadow-xl"
        >
          <div className="flex gap-3">
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-16 w-12 shrink-0 object-cover"
            />
            <div className="min-w-0">
              <Link
                to={`/mehsul/${product.slug}`}
                onClick={onClose}
                className="block text-sm font-medium leading-snug tracking-wide text-ink-900 transition-colors hover:text-clay-600"
              >
                {product.name}
              </Link>
              <p className="mt-0.5 text-xs text-ink-400">{product.fabric.material}</p>
              <p className="mt-1 text-sm text-ink-900">{formatPrice(product.basePrice)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={quickAdd}
            disabled={!quickSize}
            className="mt-3 flex w-full items-center justify-center gap-2 border border-ink-900 py-2.5 text-[9px] font-medium uppercase tracking-[0.25em] text-ink-900 transition-colors hover:bg-ink-900 hover:text-linen-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ShoppingBag size={12} strokeWidth={1.5} />
            Səbətə əlavə et
          </button>
        </div>
      )}
    </>
  )
}

export function EditorialLookbook() {
  const { content } = useEditorial()
  const lookbook = content.lookbook
  const [openKey, setOpenKey] = useState(null)

  return (
    <section className="bg-linen-50">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-ink-400">
              {lookbook.eyebrow}
            </p>
            <h2 className="mt-4 font-display text-3xl tracking-[0.02em] text-ink-900 md:text-4xl">
              {lookbook.title}
            </h2>
          </div>
          <span className="hidden text-[10px] uppercase tracking-[0.3em] text-ink-400 md:block">
            {String(lookbook.looks.length).padStart(2, '0')} look
          </span>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
          {lookbook.looks.map((look, index) => (
            <article
              key={look.number}
              className={`group ${index === 1 ? 'md:mt-16' : ''} ${index === 2 ? 'md:mt-8' : ''}`}
            >
              <div className="relative">
                {/* Kapatma katmanı — popover açıkken görsel dışı tıklamaları yutar */}
                {openKey !== null && (
                  <button
                    type="button"
                    aria-label="Məhsul pəncərəsini bağla"
                    tabIndex={-1}
                    onClick={() => setOpenKey(null)}
                    className="absolute inset-0 z-[5] cursor-default"
                  />
                )}
                <div className="overflow-hidden bg-linen-100">
                  <img
                    src={look.image}
                    alt={`Look ${look.number} — ${look.title}`}
                    loading="lazy"
                    className={`w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] ${
                      index === 1 ? 'aspect-[3/4]' : 'aspect-[3/4] md:aspect-[2/3]'
                    }`}
                  />
                </div>
                <span className="absolute left-4 top-4 z-10 bg-linen-50/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.25em] text-ink-900 backdrop-blur-sm">
                  Look {look.number}
                </span>

                {/* Shoppable hotspot'lar (CMS verisinden) — kırpılmayan katmanda */}
                {(look.hotspots ?? []).map((hotspot, hotspotIndex) => {
                  const key = `${index}-${hotspotIndex}`
                  return (
                    <div
                      key={hotspot.productSlug}
                      className="absolute z-10"
                      style={{
                        left: `${hotspot.x}%`,
                        top: `${hotspot.y}%`,
                      }}
                    >
                      <LookHotspot
                        hotspot={hotspot}
                        open={openKey === key}
                        onToggle={() => setOpenKey(openKey === key ? null : key)}
                        onClose={() => setOpenKey(null)}
                      />
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <h3 className="font-display text-xl tracking-[0.03em] text-ink-900">
                  {look.title}
                </h3>
                <Link
                  to={look.ctaLink || '/katalog'}
                  className="flex shrink-0 items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-ink-500 transition-colors hover:text-clay-600"
                >
                  {look.ctaLabel}
                  <ArrowRight
                    size={13}
                    strokeWidth={1.5}
                    className="transition-transform duration-300 group-hover:translate-x-0.5"
                  />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
