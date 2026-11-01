import { BadgeCheck, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { RatingStars } from '../../product/RatingStars.jsx'
import { Avatar, Button, StatusBadge, microLabelClass } from '../adminUi.jsx'
import { formatDate, formatRelative } from './reviewFilters.js'
import { STATUS_ACTIONS } from './reviewStatus.js'

const rowMotion = 'transition-[opacity,transform] duration-200 ease-soft'
const leavingMotion = 'pointer-events-none translate-x-3 opacity-0'

export function VerifiedMark({ withLabel = false }) {
  return (
    <span className="inline-flex items-center gap-1 text-sage-600" title="Bu məhsulu sifariş etmiş müştəri">
      <BadgeCheck size={13} strokeWidth={1.75} aria-hidden="true" />
      <span className={withLabel ? 'text-[9px] font-medium uppercase tracking-[0.2em]' : 'sr-only'}>
        Təsdiqlənmiş alıcı
      </span>
    </span>
  )
}

function DateCell({ value }) {
  return (
    <time dateTime={value} title={formatDate(value)} className="text-xs text-ink-500">
      {formatRelative(value)}
    </time>
  )
}

/** Icon buttons in the table row; clicks do not open the detail panel. */
function RowActions({ review, busy, onChangeStatus, onDelete }) {
  return (
    <div className="flex justify-end gap-1.5" onClick={(event) => event.stopPropagation()}>
      {STATUS_ACTIONS.filter((action) => action.status !== review.status).map((action) => {
        const Icon = action.icon
        return (
          <Button
            key={action.status}
            size="icon"
            variant={action.variant}
            disabled={busy}
            aria-label={`${action.label}: ${review.userName}, ${review.productName}`}
            title={action.label}
            onClick={() => onChangeStatus(review, action.status)}
          >
            <Icon size={14} strokeWidth={1.75} />
          </Button>
        )
      })}
      {/* Set apart from the status actions: deleting is permanent. */}
      <span aria-hidden="true" className="mx-0.5 w-px self-stretch bg-linen-200" />
      <Button
        size="icon"
        variant="ghost"
        disabled={busy}
        aria-label={`Sil: ${review.userName}, ${review.productName}`}
        title="Sil"
        onClick={() => onDelete(review)}
        className="hover:text-clay-600"
      >
        <Trash2 size={14} strokeWidth={1.5} />
      </Button>
    </div>
  )
}

/**
 * Moderation list for one page: a table from xl up, cards below. A row whose status no longer matches the filter
 * slides out (`leavingIds`); a row that changed but stays flashes once (`flashId`).
 */
export function ReviewsList({ reviews, selectedId, busyIds, leavingIds, flashId, onOpen, onChangeStatus, onDelete }) {
  return (
    <>
      <table className="mt-6 hidden w-full table-fixed border-collapse xl:table">
        <thead>
          <tr className="border-b border-ink-900/10 text-left">
            <th scope="col" className={`${microLabelClass} w-[17%] pb-3 font-medium`}>Müəllif</th>
            <th scope="col" className={`${microLabelClass} pb-3 font-medium`}>Rəy</th>
            <th scope="col" className={`${microLabelClass} w-[17%] pb-3 font-medium`}>Məhsul</th>
            <th scope="col" className={`${microLabelClass} w-[10%] pb-3 font-medium`}>Tarix</th>
            <th scope="col" className={`${microLabelClass} w-[12%] pb-3 font-medium`}>Status</th>
            <th scope="col" className={`${microLabelClass} w-[128px] pb-3 text-right font-medium`}>
              <span className="sr-only">Əməliyyatlar</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((review) => (
            <tr
              key={review.id}
              onClick={() => onOpen(review)}
              className={`group cursor-pointer border-b border-linen-200 align-top ${rowMotion} ${
                leavingIds.has(review.id) ? leavingMotion : ''
              } ${flashId === review.id ? 'animate-row-flash' : ''} ${
                selectedId === review.id ? 'bg-linen-100' : 'hover:bg-linen-100/60'
              }`}
            >
              <td className="py-4 pr-4">
                <div className="flex items-center gap-3">
                  <Avatar name={review.userName} />
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 truncate text-sm text-ink-900">
                      <span className="truncate">{review.userName}</span>
                      {review.isVerifiedBuyer && <VerifiedMark />}
                    </p>
                    <RatingStars value={review.rating} size={11} className="mt-1 text-ink-900" />
                  </div>
                </div>
              </td>
              <td className="py-4 pr-6">
                {/* The comment is the keyboard target for opening the detail panel. */}
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    onOpen(review)
                  }}
                  className="block w-full text-left text-sm leading-relaxed text-ink-700 outline-none transition-colors group-hover:text-ink-900 focus-visible:underline focus-visible:decoration-clay-500 focus-visible:underline-offset-4"
                >
                  <span className="line-clamp-2">{review.comment}</span>
                </button>
              </td>
              <td className="py-4 pr-4">
                <p className="truncate text-xs text-ink-700" title={review.productName}>{review.productName}</p>
              </td>
              <td className="py-4 pr-4">
                <DateCell value={review.createdAt} />
              </td>
              <td className="py-4 pr-4">
                <StatusBadge status={review.status} />
              </td>
              <td className="py-3.5">
                <RowActions review={review} busy={busyIds.has(review.id)} onChangeStatus={onChangeStatus} onDelete={onDelete} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="mt-6 space-y-3 xl:hidden">
        {reviews.map((review) => (
          <li
            key={review.id}
            className={`${rowMotion} ${leavingIds.has(review.id) ? leavingMotion : ''}`}
          >
            <article
              className={`border bg-linen-50 px-5 py-4 transition-colors duration-200 ${
                flashId === review.id ? 'animate-row-flash' : ''
              } ${selectedId === review.id ? 'border-ink-900/30' : 'border-linen-200 hover:border-ink-900/20'}`}
            >
              <header className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={review.userName} />
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-sm text-ink-900">
                      <span className="truncate">{review.userName}</span>
                      {review.isVerifiedBuyer && <VerifiedMark />}
                    </p>
                    <p className="truncate text-[11px] text-ink-400">
                      {review.productName} · <DateCell value={review.createdAt} />
                    </p>
                  </div>
                </div>
                <StatusBadge status={review.status} />
              </header>

              <button type="button" onClick={() => onOpen(review)} className="mt-3 block w-full text-left">
                <RatingStars value={review.rating} size={12} className="text-ink-900" />
                <span className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-700">{review.comment}</span>
                <span className="mt-2 inline-block text-[10px] uppercase tracking-[0.25em] text-ink-400 underline-offset-4 hover:underline">
                  Ətraflı bax
                </span>
              </button>

              <div className="mt-4 flex flex-wrap gap-2 border-t border-linen-200 pt-3">
                {STATUS_ACTIONS.filter((action) => action.status !== review.status).map((action) => {
                  const Icon = action.icon
                  return (
                    <Button
                      key={action.status}
                      size="sm"
                      variant={action.variant}
                      disabled={busyIds.has(review.id)}
                      onClick={() => onChangeStatus(review, action.status)}
                    >
                      <Icon size={13} strokeWidth={1.75} />
                      {action.label}
                    </Button>
                  )
                })}
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={busyIds.has(review.id)}
                  onClick={() => onDelete(review)}
                  className="ml-auto hover:text-clay-600"
                >
                  <Trash2 size={13} strokeWidth={1.5} />
                  Sil
                </Button>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </>
  )
}

export function ListSkeleton() {
  return (
    <div role="status" aria-label="Rəylər yüklənir" className="mt-6 space-y-px">
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="flex items-center gap-4 border-b border-linen-200 py-5">
          <span className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-linen-200" />
          <span className="flex-1 space-y-2">
            <span className="block h-2.5 w-1/4 animate-pulse bg-linen-200" />
            <span className="block h-2.5 w-3/4 animate-pulse bg-linen-200/70" />
          </span>
          <span className="hidden h-6 w-24 animate-pulse bg-linen-200/70 sm:block" />
        </div>
      ))}
    </div>
  )
}

/** Page numbers with gaps ("1 … 4 5 6 … 12") around the current page. */
function pageNumbers(page, pageCount) {
  const pages = new Set([1, pageCount, page - 1, page, page + 1])
  const sorted = [...pages].filter((value) => value >= 1 && value <= pageCount).sort((a, b) => a - b)
  return sorted.flatMap((value, index) => (index > 0 && value - sorted[index - 1] > 1 ? ['gap', value] : [value]))
}

export function Pagination({ page, pageCount, total, pageSize, onPageChange }) {
  if (pageCount <= 1) return null
  const first = (page - 1) * pageSize + 1
  const last = Math.min(page * pageSize, total)
  const pageButton =
    'flex h-8 min-w-8 items-center justify-center border px-2 text-[11px] tabular-nums transition-colors duration-200 disabled:pointer-events-none disabled:opacity-30'

  return (
    <nav aria-label="Səhifələr" className="mt-6 flex flex-wrap items-center justify-between gap-3">
      <p className="text-[11px] tabular-nums text-ink-500">
        {first}–{last} / {total}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Əvvəlki səhifə"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className={`${pageButton} border-ink-900/15 text-ink-700 hover:border-ink-900`}
        >
          <ChevronLeft size={14} strokeWidth={1.5} />
        </button>
        {pageNumbers(page, pageCount).map((value, index) =>
          value === 'gap' ? (
            <span key={`gap-${index}`} className="px-1 text-ink-400">…</span>
          ) : (
            <button
              key={value}
              type="button"
              aria-current={value === page ? 'page' : undefined}
              onClick={() => onPageChange(value)}
              className={`${pageButton} ${
                value === page
                  ? 'border-ink-900 bg-ink-900 text-linen-50'
                  : 'border-ink-900/15 text-ink-700 hover:border-ink-900'
              }`}
            >
              {value}
            </button>
          ),
        )}
        <button
          type="button"
          aria-label="Növbəti səhifə"
          disabled={page === pageCount}
          onClick={() => onPageChange(page + 1)}
          className={`${pageButton} border-ink-900/15 text-ink-700 hover:border-ink-900`}
        >
          <ChevronRight size={14} strokeWidth={1.5} />
        </button>
      </div>
    </nav>
  )
}
