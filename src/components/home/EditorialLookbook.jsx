import { ArrowRight, Plus, ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useProducts } from '../../context/ProductsContext'
import { useContentSection, useSiteContent } from '../../context/SiteContentContext'
import { formatPrice } from '../../services/formatPrice'
import { hideBrokenImage } from '../../services/imageFallback.js'
import { Reveal } from '../motion/Reveal.jsx'

/**
 * Ana səhifə zənginləşdirməsi — Editoryal Lookbook.
 * Asimetrik 12 sütunlu grid: 5/4/3 genişlikte, farklı yüksekliklerden başlayan kadrlar.
 * Shoppable hotspots: görsel üzerindeki noktaya tıklayınca ürün popover'ı açılır
 * (ad, fiyat, hızlı sepete ekle). Kadrlar və hotspot-lar admin panelinin Lookbook səhifəsindən gəlir
 * (yalnız dərc olunanlar, panelindəki sıra ilə); nömrələr bu sıradan çıxır.
 */

/** Ürünün stokta olan ilk ölçüsünü döndürür (yoksa null). */
function firstInStockSize(product) {
  return product.sizes.find((size) => (product.stock[size] ?? 0) > 0) ?? null
}

function LookHotspot({ hotspot, open, onToggle, onClose }) {
  const { addToCart, openCart } = useCart()
  const { products } = useProducts()
  const product = products.find((entry) => entry.slug === hotspot.productSlug)
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
          className="absolute left-1/2 top-full z-20 mt-3 w-60 -translate-x-1/2 animate-fade-up border border-linen-200 bg-linen-50 p-4 shadow-lg shadow-ink-900/10"
        >
          <div className="flex gap-3">
            <img
              src={product.images[0]}
              onError={hideBrokenImage}
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
              <p className="mt-0.5 text-xs text-ink-500">{product.fabric.material}</p>
              <p className="mt-1 text-sm text-ink-900">{formatPrice(product.basePrice)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={quickAdd}
            disabled={!quickSize}
            className="btn-primary mt-4 min-h-10 w-full px-4 text-[11px]"
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
  const lookbook = useContentSection('lookbook')
  const looks = useSiteContent().content?.lookbook ?? []
  const { products } = useProducts()
  const [openKey, setOpenKey] = useState(null)

  if (!lookbook || looks.length === 0) return null

  // A hotspot whose product was archived or deleted is not shown (until the catalog loads, none are).
  const hasProduct = (hotspot) => products.some((product) => product.slug === hotspot.productSlug)

  // Masaüstü: tək sırada 5 / 4 / 3 sütun, hər kadr fərqli hündürlükdən başlayır — jurnal səhifəsi ritmi
  const layout = [
    { card: 'md:col-span-5', image: 'md:aspect-[4/5]', delay: 0 },
    { card: 'md:col-span-4 md:mt-32', image: 'md:aspect-[3/4]', delay: 120 },
    { card: 'md:col-span-3 md:mt-12', image: 'md:aspect-[2/3]', delay: 240 },
  ]

  return (
    <section className="bg-linen-50">
      <div className="shell py-24 md:py-32">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">{lookbook.eyebrow}</p>
            <h2 className="heading-section mt-4">{lookbook.title}</h2>
          </div>
          <span className="font-display text-lg italic text-ink-500">
            {String(looks.length).padStart(2, '0')} look
          </span>
        </Reveal>

        <div className="mt-14 grid gap-14 sm:grid-cols-2 sm:gap-x-6 md:mt-20 md:grid-cols-12 md:items-start md:gap-x-6 md:gap-y-12">
          {looks.map((look, index) => {
            const slot = layout[index % layout.length]
            const number = String(index + 1).padStart(2, '0')
            return (
            <Reveal
              as="article"
              key={look.id}
              delay={slot.delay}
              className={`group ${slot.card}`}
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
                    src={look.imageUrl}
                    onError={hideBrokenImage}
                    alt={`Look ${number} — ${look.title}`}
                    loading="lazy"
                    className={`aspect-[3/4] w-full object-cover transition-transform duration-[1400ms] ease-[var(--ease-editorial)] group-hover:scale-[1.03] ${slot.image}`}
                  />
                </div>
                <span className="absolute left-4 top-4 z-10 bg-linen-50 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-900">
                  Look {number}
                </span>

                {/* Shoppable hotspot'lar (admin panelindən) — kırpılmayan katmanda */}
                {look.hotspots.filter(hasProduct).map((hotspot, hotspotIndex) => {
                  const key = `${index}-${hotspotIndex}`
                  return (
                    <div
                      key={key}
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
              <div className="mt-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-t border-linen-200 pt-4">
                <h3 className="font-display text-2xl font-light tracking-[-0.01em] text-ink-900">
                  <span className="mr-3 text-base italic text-clay-600">{number}</span>
                  {look.title}
                </h3>
                {look.ctaLabel && (
                  <Link to={look.ctaLink || '/katalog'} className="link-underline text-ink-700">
                    {look.ctaLabel}
                    <ArrowRight
                      size={13}
                      strokeWidth={1.5}
                      className="transition-transform duration-300 group-hover:translate-x-0.5"
                    />
                  </Link>
                )}
              </div>
            </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
