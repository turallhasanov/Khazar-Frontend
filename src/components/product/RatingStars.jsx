import { Star } from 'lucide-react'
import { useState } from 'react'

const STARS = [1, 2, 3, 4, 5]

/**
 * Read-only ★★★★★ indicator. Fractional values (e.g. 4.3) fill the last star partially,
 * by clipping a filled row of stars over an outlined one.
 */
export function RatingStars({ value = 0, size = 14, className = '' }) {
  const percent = Math.max(0, Math.min(5, value)) * 20
  return (
    <span
      role="img"
      aria-label={`5 ulduzdan ${value.toLocaleString('az-AZ', { maximumFractionDigits: 1 })}`}
      className={`relative inline-flex shrink-0 ${className}`}
    >
      <span className="flex gap-0.5 text-current opacity-30">
        {STARS.map((star) => (
          <Star key={star} size={size} strokeWidth={1.5} />
        ))}
      </span>
      <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${percent}%` }}>
        <span className="flex gap-0.5 text-clay-400">
          {STARS.map((star) => (
            <Star key={star} size={size} strokeWidth={1.5} className="shrink-0 fill-current" />
          ))}
        </span>
      </span>
    </span>
  )
}

const RATING_LABELS = { 1: 'Zəif', 2: 'Orta', 3: 'Yaxşı', 4: 'Çox yaxşı', 5: 'Əla' }

/** Star picker for the review form: a radio group, so arrow keys and screen readers work as usual. */
export function StarRatingInput({ value, onChange, name = 'rating' }) {
  const [hovered, setHovered] = useState(0)
  const shown = hovered || value

  return (
    <div className="flex items-center gap-4">
      <div role="radiogroup" aria-label="Qiymətiniz" className="flex gap-1" onMouseLeave={() => setHovered(0)}>
        {STARS.map((star) => (
          <label
            key={star}
            onMouseEnter={() => setHovered(star)}
            className="cursor-pointer rounded-sm p-0.5 transition-transform hover:scale-110 has-[:focus-visible]:outline has-[:focus-visible]:outline-1 has-[:focus-visible]:outline-clay-400"
          >
            <input
              type="radio"
              name={name}
              value={star}
              checked={value === star}
              onChange={() => onChange(star)}
              className="sr-only"
              aria-label={`${star} ulduz — ${RATING_LABELS[star]}`}
            />
            <Star
              size={26}
              strokeWidth={1.25}
              className={`transition-colors ${
                star <= shown ? 'fill-clay-400 text-clay-400' : 'text-linen-200/40'
              }`}
            />
          </label>
        ))}
      </div>
      <span className="min-w-20 text-[10px] uppercase tracking-[0.3em] text-linen-200/60">
        {shown ? RATING_LABELS[shown] : 'Seçin'}
      </span>
    </div>
  )
}
