import { Heart } from 'lucide-react'
import { useState } from 'react'
import { useWishlist } from '../../context/WishlistContext'

/**
 * İstək siyahısı düyməsi — krem dairə; əlavə edəndə ürək qısa "pop" edir, ətrafında incə halqa açılır.
 * ProductCard (şəkil üzərində) və Editoryal səhnə (mətn panelində) eyni düyməni işlədir.
 */
export function WishlistButton({ product, className = '' }) {
  const { isInWishlist, toggleWishlist } = useWishlist()
  const wished = isInWishlist(product.id)
  const [popping, setPopping] = useState(false)

  const onClick = () => {
    if (!wished) setPopping(true)
    toggleWishlist(product.id)
  }

  return (
    <button
      type="button"
      aria-label={wished ? `${product.name} istək siyahısından sil` : `${product.name} istək siyahısına əlavə et`}
      aria-pressed={wished}
      onClick={onClick}
      className={`relative flex h-10 w-10 items-center justify-center rounded-full bg-linen-50/90 text-ink-900 transition duration-300 ease-[var(--ease-soft)] hover:scale-105 hover:bg-linen-50 hover:text-clay-600 active:scale-95 motion-reduce:hover:scale-100 ${className}`}
    >
      {popping && (
        <span
          aria-hidden="true"
          // The ring outlasts the heart pop, so it ends the effect.
          onAnimationEnd={() => setPopping(false)}
          className="pointer-events-none absolute inset-0 animate-heart-ring rounded-full border border-clay-600"
        />
      )}
      <Heart
        size={16}
        strokeWidth={1.5}
        className={`transition-colors duration-300 ${wished ? 'fill-clay-600 text-clay-600' : ''} ${
          popping ? 'animate-heart-pop' : ''
        }`}
      />
    </button>
  )
}

/**
 * Rəng nöqtələri — 24px toxunma sahəsi, içində nöqtə; seçiləndə halqa açılır və nöqtə qısa "nəfəs alır".
 * `dotClass` nöqtənin ölçüsünü verir (kartda 12px, səhnədə daha böyük).
 */
export function ColorSwatches({ colors, selectedIndex, onSelect, max = colors.length, dotClass = 'h-3 w-3' }) {
  const extra = colors.length - max

  return (
    <ul className="flex shrink-0 items-center" aria-label={`Rənglər: ${colors.map((color) => color.name).join(', ')}`}>
      {colors.slice(0, max).map((color, index) => {
        const selected = index === selectedIndex
        return (
          <li key={color.name}>
            <button
              type="button"
              title={color.name}
              aria-label={`Rəng: ${color.name}`}
              aria-pressed={selected}
              onClick={() => onSelect(index)}
              className="group/swatch flex h-6 min-w-6 items-center justify-center rounded-full px-1"
            >
              <span
                key={selected ? 'on' : 'off'}
                className={`block rounded-full ring-offset-linen-50 transition-[box-shadow,transform] duration-300 ease-[var(--ease-editorial)] group-hover/swatch:scale-110 ${dotClass} ${
                  selected ? 'animate-swatch-in ring-1 ring-ink-900 ring-offset-2' : 'ring-1 ring-ink-900/15 ring-offset-1'
                }`}
                style={{ backgroundColor: color.hex }}
              />
            </button>
          </li>
        )
      })}
      {extra > 0 && <li className="pl-1 text-xs tracking-wider text-ink-500">+{extra}</li>}
    </ul>
  )
}
