import { ArrowUpRight, ChevronLeft, ChevronRight, Info, Trash2 } from 'lucide-react'
import { useEffect } from 'react'
import { RatingStars } from '../../product/RatingStars.jsx'
import { Avatar, Button, Drawer, DrawerCloseButton, StatusBadge, microLabelClass } from '../adminUi.jsx'
import { VerifiedMark } from './ReviewsList.jsx'
import { formatDateTime, formatRelative } from './reviewFilters.js'
import { REVIEW_STATUS, STATUS_ACTIONS } from './reviewStatus.js'

const RATING_WORDS = { 1: 'Zəif', 2: 'Orta', 3: 'Yaxşı', 4: 'Çox yaxşı', 5: 'Əla' }

// Keyboard shortcuts while the panel is open (ignored while typing in a field).
const SHORTCUT_STATUS = { a: 'Approved', r: 'Rejected', p: 'Pending' }
const SHORTCUT_KEYS = { Approved: 'A', Rejected: 'R', Pending: 'P' }

function isTyping(target) {
  return target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
}

function Kbd({ children }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center border border-ink-900/15 bg-linen-100 px-1 font-sans text-[10px] text-ink-500">
      {children}
    </kbd>
  )
}

/**
 * Full review in a slide-over: author, rating, complete text, product and moderation actions.
 * ←/→ (or K/J) move through the filtered list; A / R / P change the status.
 */
export function ReviewDetailDrawer({ review, open, position, busy, onClose, onPrev, onNext, onChangeStatus, onDelete }) {
  useEffect(() => {
    if (!open || !review) return undefined
    const onKeyDown = (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey || isTyping(event.target)) return
      const key = event.key.toLowerCase()
      if ((key === 'arrowright' || key === 'j') && onNext) {
        event.preventDefault()
        onNext()
      } else if ((key === 'arrowleft' || key === 'k') && onPrev) {
        event.preventDefault()
        onPrev()
      } else if (SHORTCUT_STATUS[key] && SHORTCUT_STATUS[key] !== review.status && !busy) {
        event.preventDefault()
        onChangeStatus(review, SHORTCUT_STATUS[key])
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, review, busy, onNext, onPrev, onChangeStatus])

  return (
    <Drawer open={open} onClose={onClose} label="Rəyin təfərrüatları" widthClass="max-w-lg">
      {review && (
        <>
          <header className="flex items-center justify-between gap-3 border-b border-linen-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <p className={microLabelClass}>Rəy</p>
              {position && (
                <p className="text-[11px] tabular-nums text-ink-400">
                  {position.index + 1} / {position.total}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button size="icon" variant="ghost" aria-label="Əvvəlki rəy" disabled={!onPrev} onClick={onPrev}>
                <ChevronLeft size={16} strokeWidth={1.5} />
              </Button>
              <Button size="icon" variant="ghost" aria-label="Növbəti rəy" disabled={!onNext} onClick={onNext}>
                <ChevronRight size={16} strokeWidth={1.5} />
              </Button>
              <DrawerCloseButton onClick={onClose} />
            </div>
          </header>

          <div key={review.id} className="flex-1 animate-fade-in overflow-y-auto px-6 py-6">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={review.status} />
              <p className="text-xs text-ink-500">{REVIEW_STATUS[review.status]?.hint}</p>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <Avatar name={review.userName} size="lg" />
              <div className="min-w-0">
                <p className="truncate font-display text-2xl text-ink-900">{review.userName}</p>
                <div className="mt-1">
                  {review.isVerifiedBuyer ? (
                    <VerifiedMark withLabel />
                  ) : (
                    <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-ink-400">
                      Alışı təsdiqlənməyib
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3 text-ink-900">
              <RatingStars value={review.rating} size={18} />
              <span className="text-sm tabular-nums text-ink-700">{review.rating} / 5</span>
              <span className="text-[10px] uppercase tracking-[0.25em] text-ink-400">{RATING_WORDS[review.rating]}</span>
            </div>

            <blockquote className="mt-5 border-l-2 border-clay-400/60 bg-linen-100/50 px-5 py-4">
              <p className="whitespace-pre-line break-words text-[15px] leading-relaxed text-ink-900">{review.comment}</p>
              <p className="mt-3 text-right text-[10px] tabular-nums text-ink-400">{review.comment.length} simvol</p>
            </blockquote>

            <dl className="mt-6 divide-y divide-linen-200 border-y border-linen-200 text-sm">
              <div className="flex justify-between gap-4 py-3">
                <dt className="text-ink-400">Məhsul</dt>
                <dd className="min-w-0 text-right">
                  <a
                    href={`/mehsul/${review.productSlug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex items-center gap-1 text-ink-900 underline-offset-4 hover:text-clay-600 hover:underline"
                  >
                    <span className="truncate">{review.productName}</span>
                    <ArrowUpRight
                      size={13}
                      strokeWidth={1.5}
                      className="shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </a>
                </dd>
              </div>
              <div className="flex justify-between gap-4 py-3">
                <dt className="text-ink-400">Yazılıb</dt>
                <dd className="text-right text-ink-900">
                  {formatDateTime(review.createdAt)}
                  <span className="block text-[11px] text-ink-400">{formatRelative(review.createdAt)}</span>
                </dd>
              </div>
              {review.updatedAt && (
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-ink-400">Son dəyişiklik</dt>
                  <dd className="text-right text-ink-900">{formatDateTime(review.updatedAt)}</dd>
                </div>
              )}
            </dl>

            <p className="mt-6 flex gap-2 text-[11px] leading-relaxed text-ink-400">
              <Info size={13} strokeWidth={1.5} className="mt-0.5 shrink-0" />
              Müştərinin mətni dəyişdirilmir. Saytdan gizlətmək üçün rədd edin — bu qərarı istənilən vaxt dəyişmək olar;
              silmək isə geri qaytarıla bilməz.
            </p>
          </div>

          <footer className="border-t border-linen-200 bg-linen-100/40 px-6 py-4">
            <div className="grid grid-cols-2 gap-2">
              {STATUS_ACTIONS.filter((action) => action.status !== review.status).map((action) => {
                const Icon = action.icon
                return (
                  <Button
                    key={action.status}
                    variant={action.variant}
                    disabled={busy}
                    onClick={() => onChangeStatus(review, action.status)}
                  >
                    <Icon size={14} strokeWidth={1.75} />
                    {action.label}
                    <span className="hidden opacity-60 sm:inline">· {SHORTCUT_KEYS[action.status]}</span>
                  </Button>
                )
              })}
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="hidden items-center gap-1.5 text-[10px] text-ink-400 sm:flex">
                <Kbd>←</Kbd>
                <Kbd>→</Kbd>
                rəylər arasında keçid
                <span className="mx-1">·</span>
                <Kbd>Esc</Kbd>
                bağla
              </p>
              <Button size="sm" variant="ghost" disabled={busy} onClick={() => onDelete(review)} className="ml-auto hover:text-clay-600">
                <Trash2 size={13} strokeWidth={1.5} />
                Rəyi sil
              </Button>
            </div>
          </footer>
        </>
      )}
    </Drawer>
  )
}
