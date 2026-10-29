import { ChevronDown, Heart, ShoppingBag } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { CompleteTheLook } from '../components/product/CompleteTheLook'
import { ProductReviews, RatingSummaryLink } from '../components/product/ProductReviews'
import { SizeGuideModal } from '../components/product/SizeGuideModal'
import { useProductReviews } from '../hooks/useProductReviews.js'
import { formatPrice } from '../services/formatPrice.js'
import { getProductBySlug } from '../services/productService.js'
import { hideBrokenImage } from '../services/imageFallback.js'

/** Seçili bedenin stok durumuna göre gösterge metni ve tonu. */
function stockStatus(stock) {
  if (!stock || stock <= 0) return { label: 'Tükəndi', tone: 'out' }
  if (stock <= 3) return { label: `Stokda son ${stock} ədəd`, tone: 'low' }
  return { label: 'Stokda var', tone: 'in' }
}

const toneClass = {
  out: 'text-clay-600',
  low: 'text-clay-600',
  in: 'text-sage-600',
}

function AccordionSection({
  title,
  children,
  defaultOpen = false,
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-ink-900/10">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="flex w-full items-center justify-between py-4 text-left text-[11px] font-medium uppercase tracking-[0.25em] text-ink-900"
      >
        {title}
        <ChevronDown
          size={16}
          strokeWidth={1.5}
          className={`text-ink-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className="pb-5 text-sm leading-relaxed text-ink-500">{children}</div>}
    </div>
  )
}

function PageMessage({ title, children }) {
  return (
    <main className="flex-1">
      <div className="mx-auto max-w-6xl px-6 py-32 text-center">
        <h1 className="font-display text-3xl text-ink-900">{title}</h1>
        {children}
        <Link
          to="/katalog"
          className="mt-8 inline-block border border-ink-900 px-8 py-3 text-[11px] uppercase tracking-[0.3em] text-ink-900 transition-colors hover:bg-ink-900 hover:text-linen-50"
        >
          Kataloqa qayıt
        </Link>
      </div>
    </main>
  )
}

/** Loads the product from GET /api/products/slug/{slug}; a 404 shows the "not found" screen. */
export function ProductDetailPage() {
  const { slug } = useParams()
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState({ key: null, product: null, status: 'loading' })
  const requestKey = `${slug}#${attempt}`

  useEffect(() => {
    const controller = new AbortController()
    getProductBySlug(slug, { signal: controller.signal })
      .then((product) => setResult({ key: requestKey, product, status: 'ready' }))
      .catch((error) => {
        if (error.name === 'AbortError') return
        setResult({
          key: requestKey,
          product: null,
          status: error.status === 404 ? 'not-found' : 'error',
        })
      })
    return () => controller.abort()
  }, [slug, requestKey])

  // A result from a previous slug (or attempt) counts as loading until the new response arrives.
  const status = result.key === requestKey ? result.status : 'loading'

  if (status === 'loading') {
    return (
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-32 text-center text-[10px] uppercase tracking-[0.35em] text-ink-400">
          Yüklənir…
        </div>
      </main>
    )
  }

  if (status === 'not-found') return <PageMessage title="Məhsul tapılmadı" />

  if (status === 'error') {
    return (
      <PageMessage title="Məhsul yüklənmədi">
        <p className="mt-3 text-sm text-ink-400">Serverə qoşulmaq mümkün olmadı.</p>
        <button
          type="button"
          onClick={() => setAttempt((current) => current + 1)}
          className="mt-6 block w-full text-[11px] uppercase tracking-[0.3em] text-ink-500 underline-offset-4 hover:text-clay-600 hover:underline"
        >
          Yenidən yoxla
        </button>
      </PageMessage>
    )
  }

  // Keyed by id so color/size selection resets when navigating to another product.
  return <ProductDetailView key={result.product.id} product={result.product} />
}

/**
 * Mikro-Aşama 8: Ürün detay sayfası — editoryal galeri, beden/renk matrisi,
 * dinamik stok göstergesi, kumaş & bakım akordeonu.
 * Stock is resolved per color + size from the API's variants, falling back to the per-size matrix.
 */
function ProductDetailView({ product }) {
  const [selectedColorIndex, setSelectedColorIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState(null)
  const [activeImage, setActiveImage] = useState(0)
  const [added, setAdded] = useState(false)
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)
  const { addToCart, openCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()
  // Shared by the star summary under the title and the reviews section.
  const reviews = useProductReviews(product.id)

  const color = product.colors[selectedColorIndex]

  // The detail payload carries per-variant stock, so availability reflects the selected color too.
  const variantStock = (size) =>
    color
      ? (product.variants?.find((v) => v.color === color.name && v.size === size)?.stockQuantity ??
        product.stock[size] ??
        0)
      : (product.stock[size] ?? 0)

  const status = selectedSize ? stockStatus(variantStock(selectedSize)) : null

  const discountPercent = product.compareAtPrice
    ? Math.round((1 - product.basePrice / product.compareAtPrice) * 100)
    : null

  const selectColor = (index) => {
    setSelectedColorIndex(index)
    // Images are not per color yet: cycle through the gallery by color index.
    if (product.images.length > 0) setActiveImage(index % product.images.length)
    // The chosen size may be sold out in the new color.
    setSelectedSize(null)
  }

  const handleAddToCart = () => {
    if (!selectedSize || !color) return
    addToCart(product, color, selectedSize)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1800)
    openCart()
  }

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Link
          to="/katalog"
          className="text-[10px] uppercase tracking-[0.3em] text-ink-400 transition-colors hover:text-ink-900"
        >
          ← Kataloq
        </Link>

        <div className="mt-6 grid gap-12 md:grid-cols-2">
          {/* Galeri */}
          <div>
            <div className="aspect-[3/4] overflow-hidden bg-linen-100">
              <img
                src={product.images[activeImage]}
                onError={hideBrokenImage}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="mt-4 flex gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    aria-label={`Şəkil ${index + 1}`}
                    onClick={() => setActiveImage(index)}
                    className={`h-20 w-16 overflow-hidden border transition-colors ${
                      activeImage === index
                        ? 'border-ink-900'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={image} alt="" onError={hideBrokenImage} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detaylar */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-ink-400">
              {product.categoryLabel || product.category}
              {product.isNew && <span className="ml-3 text-sage-600">· New</span>}
              {product.isBestseller && <span className="ml-3 text-clay-600">· Bestseller</span>}
            </p>
            <h1 className="mt-3 font-display text-4xl leading-tight tracking-[0.02em] text-ink-900">
              {product.name}
            </h1>
            <RatingSummaryLink reviews={reviews} />

            <div className="mt-4 flex items-baseline gap-3">
              <span
                className={`text-xl ${product.compareAtPrice ? 'text-clay-600' : 'text-ink-900'}`}
              >
                {formatPrice(product.basePrice)}
              </span>
              {product.compareAtPrice && (
                <span className="text-sm text-ink-400 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
              {discountPercent && (
                <span className="bg-clay-500 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-linen-50">
                  -{discountPercent}%
                </span>
              )}
            </div>

            <p className="mt-5 text-sm leading-relaxed text-ink-500">{product.description}</p>

            {/* Renk seçimi */}
            <div className="mt-8">
              <p className="text-[10px] uppercase tracking-[0.3em] text-ink-400">
                Rəng — <span className="text-ink-700">{color?.name}</span>
              </p>
              <div className="mt-3 flex gap-3">
                {product.colors.map((entry, index) => (
                  <button
                    key={entry.name}
                    type="button"
                    title={entry.name}
                    aria-label={entry.name}
                    aria-pressed={index === selectedColorIndex}
                    onClick={() => selectColor(index)}
                    className={`h-7 w-7 rounded-full border border-ink-900/20 transition-all ${
                      index === selectedColorIndex
                        ? 'ring-2 ring-ink-900 ring-offset-2 ring-offset-linen-50'
                        : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: entry.hex }}
                  />
                ))}
              </div>
            </div>

            {/* Beden matrisi */}
            <div className="mt-8">
              <div className="flex items-baseline justify-between">
                <p className="text-[10px] uppercase tracking-[0.3em] text-ink-400">Ölçü</p>
                <button
                  type="button"
                  onClick={() => setSizeGuideOpen(true)}
                  className="text-[10px] uppercase tracking-[0.2em] text-ink-400 underline decoration-ink-900/30 underline-offset-4 transition-colors hover:text-clay-600"
                >
                  Beden Ölçü Rehberi
                </button>
                {!selectedSize && (
                  <p className="text-[10px] uppercase tracking-[0.2em] text-clay-600">
                    Ölçü seçin
                  </p>
                )}
              </div>
              <div className="mt-3 grid grid-cols-6 gap-2">
                {product.sizes.map((size) => {
                  const inStock = variantStock(size) > 0
                  const active = selectedSize === size
                  return (
                    <button
                      key={size}
                      type="button"
                      disabled={!inStock}
                      aria-pressed={active}
                      onClick={() => setSelectedSize(size)}
                      className={`border py-2.5 text-xs tracking-[0.15em] transition-colors ${
                        !inStock
                          ? 'cursor-not-allowed border-ink-900/10 text-ink-400 line-through'
                          : active
                            ? 'border-ink-900 bg-ink-900 text-linen-50'
                            : 'border-ink-900/25 text-ink-700 hover:border-ink-900'
                      }`}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Stok göstergesi */}
            <div className="mt-5 min-h-5">
              {status && (
                <p className={`text-xs uppercase tracking-[0.2em] ${toneClass[status.tone]}`}>
                  {status.label}
                  <span className="ml-2 text-ink-400 normal-case tracking-normal">
                    ({color?.name} / {selectedSize})
                  </span>
                </p>
              )}
            </div>

            {/* Sepete ekle + wishlist */}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                disabled={!selectedSize || status?.tone === 'out'}
                onClick={handleAddToCart}
                className={`flex min-h-14 flex-1 items-center justify-center gap-3 text-xs font-medium uppercase tracking-[0.14em] transition duration-300 active:translate-y-px ${
                  added
                    ? 'bg-sage-600 text-linen-50'
                    : 'bg-clay-600 text-linen-50 hover:bg-clay-700'
                } disabled:cursor-not-allowed disabled:bg-linen-200 disabled:text-ink-500 disabled:active:translate-y-0`}
              >
                <ShoppingBag size={16} strokeWidth={1.5} />
                {added ? 'Səbətə əlavə edildi' : 'Səbətə əlavə et'}
              </button>
              <button
                type="button"
                aria-pressed={isInWishlist(product.id)}
                aria-label={
                  isInWishlist(product.id)
                    ? 'İstək siyahısından sil'
                    : 'İstək siyahısına əlavə et'
                }
                onClick={() => toggleWishlist(product.id)}
                className={`flex w-14 shrink-0 items-center justify-center border transition-colors ${
                  isInWishlist(product.id)
                    ? 'border-clay-600 text-clay-600'
                    : 'border-ink-900/25 text-ink-700 hover:border-ink-900 hover:text-clay-600'
                }`}
              >
                <Heart
                  size={18}
                  strokeWidth={1.5}
                  className={isInWishlist(product.id) ? 'fill-clay-600' : ''}
                />
              </button>
            </div>
            {!selectedSize && (
              <p className="mt-2 text-[11px] text-ink-400">
                Davam etmək üçün ölçü seçməlisiniz.
              </p>
            )}

            {/* Kumaş & bakım akordeonu */}
            <div className="mt-10 border-t border-ink-900/10">
              <AccordionSection title="Material" defaultOpen>
                <p>{product.fabric.material}</p>
              </AccordionSection>
              {product.fabric.weave && (
                <AccordionSection title="Parça toxuması">
                  <p>{product.fabric.weave}</p>
                </AccordionSection>
              )}
              <AccordionSection title="Qulluq qaydaları">
                <ul className="list-inside list-disc space-y-1.5">
                  {product.fabric.care?.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </AccordionSection>
            </div>
          </div>
        </div>

        {/* Stili tamamla — kategoriye göre editoryal kombin önerileri */}
        <CompleteTheLook currentProduct={product} />

        {/* Rəylər — orta bal, rəy siyahısı və "Rəy yaz" forması */}
        <ProductReviews productId={product.id} reviews={reviews} />
      </div>

      <SizeGuideModal open={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
    </main>
  )
}
