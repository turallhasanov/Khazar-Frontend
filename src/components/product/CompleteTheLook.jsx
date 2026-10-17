import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { mockProducts } from '../../data/mockProducts'
import { formatPrice } from '../../services/formatPrice'

/**
 * "Stili tamamla" bloku — ürün detayının altında editoryal kombin önerileri.
 * - Kategoriye göre tamamlayıcı parçalar seçer (üst → şalvar/base, alt → üst)
 * - Hızlı sepete ekle: ilk renk + stokta olan ilk ölçü
 */

/** Mevcut kategoriye göre önerilecek tamamlayıcı kategori önceliği. */
const COMPLEMENT_CATEGORIES = {
  Hoodie: ['Pants', 'T-Shirt'],
  Sweatshirt: ['Pants', 'Longsleeve'],
  'T-Shirt': ['Pants', 'Coat'],
  Longsleeve: ['Pants', 'Coat'],
  Pants: ['T-Shirt', 'Hoodie'],
  Coat: ['Pants', 'Longsleeve'],
}

/** Kategori için ideal tamamlayıcı ürünleri seçer (mevcut ürünü hariç tutar). */
function pickComplements(currentProduct, limit = 2) {
  const priorities = COMPLEMENT_CATEGORIES[currentProduct.category] ?? ['Pants', 'T-Shirt']
  const picks = []
  for (const category of priorities) {
    const candidate = mockProducts.find(
      (product) => product.id !== currentProduct.id && product.category === category,
    )
    if (candidate) picks.push(candidate)
    if (picks.length >= limit) break
  }
  return picks
}

/** Ürünün stokta olan ilk ölçüsünü döndürür (yoksa null). */
function firstInStockSize(product) {
  return product.sizes.find((size) => (product.stock[size] ?? 0) > 0) ?? null
}

function LookCard({ product }) {
  const { addToCart, openCart } = useCart()
  const [added, setAdded] = useState(false)
  const quickSize = firstInStockSize(product)

  const handleQuickAdd = () => {
    if (!quickSize) return
    addToCart(product, product.colors[0], quickSize)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1800)
    openCart()
  }

  return (
    <article className="group">
      <Link to={`/mehsul/${product.slug}`} className="block">
        <div className="aspect-[3/4] overflow-hidden bg-linen-100">
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        </div>
      </Link>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-[9px] uppercase tracking-[0.3em] text-ink-400">
            {product.category}
          </p>
          <Link
            to={`/mehsul/${product.slug}`}
            className="mt-1 block font-display text-lg font-light leading-snug text-ink-900 transition-colors hover:text-clay-600"
          >
            {product.name}
          </Link>
          <p className="mt-1 text-sm text-ink-500">
            {product.fabric.material} · {formatPrice(product.basePrice)}
          </p>
        </div>
        <button
          type="button"
          onClick={handleQuickAdd}
          disabled={!quickSize}
          aria-label={`${product.name} səbətə əlavə et`}
          className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center border transition-colors ${
            added
              ? 'border-sage-600 bg-sage-600 text-linen-50'
              : 'border-ink-900/25 text-ink-700 hover:border-ink-900 hover:bg-ink-900 hover:text-linen-50 disabled:cursor-not-allowed disabled:opacity-40'
          }`}
        >
          <Plus size={16} strokeWidth={1.5} />
        </button>
      </div>
    </article>
  )
}

export function CompleteTheLook({ currentProduct }) {
  const complements = pickComplements(currentProduct)

  if (complements.length === 0) return null

  return (
    <section className="mt-20 border-t border-ink-900/10 pt-12">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-ink-400">
            Complete the look
          </p>
          <h2 className="mt-2 font-display text-3xl font-light text-ink-900">
            Stili tamamla
          </h2>
        </div>
        <Link
          to="/katalog"
          className="hidden text-[10px] uppercase tracking-[0.3em] text-ink-400 transition-colors hover:text-ink-900 sm:block"
        >
          Bütün kolleksiya →
        </Link>
      </div>
      <div className="mt-8 grid gap-10 sm:grid-cols-2">
        {complements.map((product) => (
          <LookCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
