import { RatingStars } from '../../product/RatingStars.jsx'
import { microLabelClass } from '../adminUi.jsx'
import { STATUS_FILTERS, formatAverage } from './reviewFilters.js'

const STATUS_CELLS = {
  Pending: { hint: 'moderasiya gözləyir', bar: 'bg-clay-500', number: 'text-clay-600' },
  Approved: { hint: 'saytda görünür', bar: 'bg-sage-600', number: 'text-ink-900' },
  Rejected: { hint: 'gizlədilib', bar: 'bg-ink-400', number: 'text-ink-900' },
  all: { hint: 'cəmi rəy', bar: 'bg-ink-900', number: 'text-ink-900' },
}

/**
 * Status strip (each cell is also the status filter) and the rating panel (each bar filters by stars).
 * Every number is computed from the reviews the API returned; nothing is estimated.
 */
export function ReviewsOverview({ statusCounts, ratingSummary, filters, onStatusChange, onRatingChange, filtered }) {
  const total = ratingSummary.counts.all

  return (
    <section aria-label="Ümumi baxış" className="mt-8 grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
      {/* 1px gaps over a linen-200 ground draw the cell dividers for both the 2×2 and the 1×4 layout. */}
      <div className="grid grid-cols-2 gap-px border border-linen-200 bg-linen-200 sm:grid-cols-4">
        {STATUS_FILTERS.map((item) => {
          const cell = STATUS_CELLS[item.value]
          const active = filters.status === item.value
          return (
            <button
              key={item.value}
              type="button"
              aria-pressed={active}
              onClick={() => onStatusChange(item.value)}
              className={`group relative flex flex-col items-start px-5 pb-5 pt-6 text-left transition-colors duration-200 focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-2 focus-visible:outline-clay-500 ${
                active ? 'bg-linen-100' : 'bg-linen-50 hover:bg-linen-100'
              }`}
            >
              <span
                aria-hidden="true"
                className={`absolute inset-x-0 top-0 h-0.5 origin-left transition-transform duration-300 ease-soft ${cell.bar} ${
                  active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-[0.15]'
                }`}
              />
              <span className={microLabelClass}>{item.label}</span>
              <span className={`mt-3 font-display text-4xl leading-none tabular-nums ${cell.number}`}>
                {statusCounts[item.value]}
              </span>
              <span className="mt-2 text-[11px] text-ink-400">{cell.hint}</span>
            </button>
          )
        })}
      </div>

      <div className="flex gap-6 border border-linen-200 px-5 py-5">
        <div className="shrink-0">
          <p className={microLabelClass}>Orta qiymət</p>
          <p className="mt-3 flex items-end gap-1.5">
            <span className="font-display text-4xl leading-none text-ink-900">{total ? formatAverage(ratingSummary.average) : '—'}</span>
            <span className="pb-0.5 text-xs text-ink-400">/ 5</span>
          </p>
          <RatingStars value={ratingSummary.average} size={12} className="mt-2.5 text-ink-900" />
          <p className="mt-2 max-w-28 text-[11px] leading-snug text-ink-400">
            {total} rəy · {filtered ? 'seçilmiş görünüş' : 'bu statusda'}
          </p>
        </div>

        <ul className="flex min-w-0 flex-1 flex-col justify-center gap-1" aria-label="Ulduz paylanması">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingSummary.distribution[star]
            const percent = total ? (count / total) * 100 : 0
            const active = filters.rating === String(star)
            const dimmed = filters.rating && !active
            return (
              <li key={star}>
                <button
                  type="button"
                  aria-pressed={active}
                  aria-label={`${star} ulduz: ${count} rəy`}
                  onClick={() => onRatingChange(active ? '' : String(star))}
                  className={`group flex w-full items-center gap-2.5 py-0.5 text-[11px] transition-opacity duration-200 focus-visible:outline focus-visible:outline-1 focus-visible:outline-clay-500 ${
                    dimmed ? 'opacity-40 hover:opacity-80' : ''
                  }`}
                >
                  <span className="w-3 text-right text-ink-500">{star}</span>
                  <span className="h-1.5 flex-1 overflow-hidden bg-linen-200/70">
                    <span
                      className={`block h-full transition-[width,background-color] duration-500 ease-soft ${
                        active ? 'bg-clay-500' : 'bg-ink-700 group-hover:bg-clay-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </span>
                  <span className="w-6 text-right tabular-nums text-ink-500">{count}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
