import { BadgeCheck, Check, MessageSquareText } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ApiError } from '../../services/api.js'
import { createProductReview } from '../../services/reviewService.js'
import { RatingStars, StarRatingInput } from './RatingStars'

const MAX_COMMENT_LENGTH = 2000

/** Frosted panel on the dark section background. */
const glassClass = 'border border-linen-50/10 bg-linen-50/[0.04] backdrop-blur-xl'

const dateFormat = new Intl.DateTimeFormat('az-AZ', { day: 'numeric', month: 'long', year: 'numeric' })

function formatAverage(value) {
  return value.toLocaleString('az-AZ', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

function describeReviewError(error) {
  if (error instanceof ApiError) {
    if (error.code === 'review_already_exists') return 'Bu məhsul üçün artıq rəy yazmısınız.'
    if (error.status === 401) return 'Sessiyanızın müddəti bitib. Yenidən daxil olun.'
    if (error.status === 429) return 'Çox sayda sorğu göndərildi. Bir az sonra yenidən cəhd edin.'
    if (error.status === 400) return error.message
    if (error.status === 0) return 'Serverə qoşulmaq mümkün olmadı.'
  }
  return 'Rəy göndərilmədi. Bir az sonra yenidən cəhd edin.'
}

/** Compact ★ summary under the product title; links to the reviews section. */
export function RatingSummaryLink({ reviews }) {
  const { data, status } = reviews
  if (status !== 'ready' || !data) return null

  return (
    <a
      href="#reviews"
      className="mt-3 inline-flex items-center gap-2.5 text-ink-900 transition-colors hover:text-clay-600"
    >
      <RatingStars value={data.averageRating} size={13} />
      <span className="text-[11px] tracking-[0.15em] text-ink-500">
        {data.reviewCount > 0
          ? `${formatAverage(data.averageRating)} · ${data.reviewCount} rəy`
          : 'Hələ rəy yoxdur — ilk siz yazın'}
      </span>
    </a>
  )
}

function RatingOverview({ data }) {
  const total = data.reviewCount
  return (
    <div className={`${glassClass} p-8`}>
      <p className="text-[10px] uppercase tracking-[0.35em] text-linen-200/50">Orta qiymət</p>
      <div className="mt-4 flex items-end gap-3">
        <span className="font-display text-6xl leading-none text-linen-50">
          {total > 0 ? formatAverage(data.averageRating) : '—'}
        </span>
        <span className="pb-1 text-sm text-linen-200/50">/ 5</span>
      </div>
      <RatingStars value={data.averageRating} size={18} className="mt-4 text-linen-50" />
      <p className="mt-3 text-xs text-linen-200/60">
        {total > 0 ? `${total} təsdiqlənmiş rəy əsasında` : 'Hələ dərc olunmuş rəy yoxdur'}
      </p>

      <ul className="mt-8 space-y-2.5">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = data.ratingDistribution?.[star] ?? 0
          const percent = total > 0 ? (count / total) * 100 : 0
          return (
            <li key={star} className="flex items-center gap-3 text-[11px] text-linen-200/60">
              <span className="w-3 text-right">{star}</span>
              <span className="h-1 flex-1 overflow-hidden bg-linen-50/10">
                <span
                  className="block h-full bg-gradient-to-r from-clay-500 to-clay-400 transition-[width] duration-700"
                  style={{ width: `${percent}%` }}
                />
              </span>
              <span className="w-6 text-right tabular-nums">{count}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function ReviewCard({ review }) {
  return (
    <article className={`${glassClass} p-6 transition-colors hover:border-linen-50/20`}>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-linen-50/15 bg-linen-50/5 font-display text-sm text-linen-100"
          >
            {review.userName.charAt(0)}
          </span>
          <div>
            <p className="text-sm text-linen-50">{review.userName}</p>
            <time dateTime={review.createdAt} className="text-[11px] text-linen-200/50">
              {dateFormat.format(new Date(review.createdAt))}
            </time>
          </div>
        </div>
        {review.isVerifiedBuyer && (
          <span className="inline-flex items-center gap-1.5 border border-sage-500/40 bg-sage-500/15 px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.25em] text-sage-100">
            <BadgeCheck size={12} strokeWidth={1.75} />
            Təsdiqlənmiş alıcı
          </span>
        )}
      </header>
      <RatingStars value={review.rating} size={13} className="mt-4 text-linen-50" />
      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-linen-200/80">{review.comment}</p>
    </article>
  )
}

function ReviewForm({ productId }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [state, setState] = useState({ status: 'idle', error: null })

  if (!isAuthenticated) {
    return (
      <div className={`${glassClass} p-8 text-center`}>
        <MessageSquareText size={22} strokeWidth={1.25} className="mx-auto text-linen-200/50" />
        <p className="mt-4 text-sm text-linen-200/70">Rəy yazmaq üçün hesabınıza daxil olun.</p>
        <Link
          to="/giris"
          state={{ from: `${location.pathname}#reviews` }}
          className="mt-6 inline-block border border-linen-50/30 px-8 py-3 text-[11px] uppercase tracking-[0.3em] text-linen-50 transition-colors hover:bg-linen-50 hover:text-ink-900"
        >
          Daxil ol
        </Link>
      </div>
    )
  }

  if (state.status === 'success') {
    return (
      <div role="status" className={`${glassClass} p-8 text-center`}>
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-sage-500/50 bg-sage-500/20 text-sage-100">
          <Check size={20} strokeWidth={1.75} />
        </span>
        <p className="mt-5 font-display text-xl text-linen-50">Təşəkkür edirik!</p>
        <p className="mt-2 text-sm text-linen-200/70">Rəyiniz moderasiyadan sonra dərc olunacaq.</p>
      </div>
    )
  }

  const trimmed = comment.trim()
  const canSubmit = rating > 0 && trimmed.length > 0 && state.status !== 'submitting'

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!canSubmit) return
    setState({ status: 'submitting', error: null })
    try {
      await createProductReview(productId, { rating, comment: trimmed })
      setState({ status: 'success', error: null })
    } catch (error) {
      setState({ status: 'idle', error: describeReviewError(error) })
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`${glassClass} p-8`} noValidate>
      <p className="text-[10px] uppercase tracking-[0.35em] text-linen-200/50">Rəy yaz</p>
      <div className="mt-5">
        <StarRatingInput value={rating} onChange={setRating} />
      </div>

      <label className="mt-6 block">
        <span className="sr-only">Rəyiniz</span>
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          maxLength={MAX_COMMENT_LENGTH}
          rows={4}
          placeholder="Parça, ölçü və rahatlıq haqqında təəssüratlarınızı bölüşün…"
          className="w-full resize-y border border-linen-50/15 bg-ink-900/40 px-4 py-3 text-sm leading-relaxed text-linen-50 outline-none transition-colors placeholder:text-linen-200/30 focus:border-linen-50/40"
        />
      </label>
      <div className="mt-2 flex justify-between text-[11px] text-linen-200/40">
        <span>{rating === 0 ? 'Ulduz seçin' : ''}</span>
        <span className="tabular-nums">
          {comment.length}/{MAX_COMMENT_LENGTH}
        </span>
      </div>

      {state.error && (
        <p role="alert" className="mt-4 border border-clay-400/40 px-4 py-3 text-xs text-clay-100">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="mt-6 w-full bg-linen-50 py-3.5 text-[11px] font-medium uppercase tracking-[0.3em] text-ink-900 transition-colors hover:bg-clay-400 hover:text-linen-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {state.status === 'submitting' ? 'Göndərilir…' : 'Rəyi göndər'}
      </button>
    </form>
  )
}

/**
 * Reviews section of the product page — dark glass panels: rating overview, review form and
 * the approved reviews (with a verified buyer badge). `reviews` comes from useProductReviews.
 */
export function ProductReviews({ productId, reviews }) {
  const { data, status, reload } = reviews

  return (
    <section
      id="reviews"
      aria-labelledby="reviews-heading"
      className="relative mt-24 scroll-mt-24 overflow-hidden bg-ink-900 px-6 py-16 text-linen-100 md:px-12"
    >
      {/* Soft color fields behind the frosted panels. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-clay-500/25 blur-3xl" />
        <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-sage-500/20 blur-3xl" />
      </div>

      <div className="relative">
        <p className="text-[10px] uppercase tracking-[0.45em] text-linen-200/50">Müştəri rəyləri</p>
        <h2 id="reviews-heading" className="mt-3 font-display text-3xl tracking-[0.02em] text-linen-50 md:text-4xl">
          Geyinənlər nə deyir
        </h2>

        {status === 'loading' && (
          <p className="mt-10 text-[10px] uppercase tracking-[0.35em] text-linen-200/50">Yüklənir…</p>
        )}

        {status === 'error' && (
          <div className="mt-10">
            <p className="text-sm text-linen-200/70">Rəylər yüklənmədi.</p>
            <button
              type="button"
              onClick={reload}
              className="mt-3 text-[11px] uppercase tracking-[0.3em] text-linen-200/70 underline-offset-4 hover:text-clay-400 hover:underline"
            >
              Yenidən yoxla
            </button>
          </div>
        )}

        {status === 'ready' && data && (
          <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
            <div className="space-y-6">
              <RatingOverview data={data} />
              <ReviewForm productId={productId} />
            </div>

            <div className="space-y-4">
              {data.reviews.length === 0 ? (
                <div className={`${glassClass} flex h-full min-h-48 flex-col items-center justify-center p-8 text-center`}>
                  <RatingStars value={0} size={20} className="text-linen-50" />
                  <p className="mt-4 text-sm text-linen-200/70">Bu məhsul üçün hələ rəy yoxdur.</p>
                  <p className="mt-1 text-xs text-linen-200/40">İlk rəyi siz yazın.</p>
                </div>
              ) : (
                data.reviews.map((review) => <ReviewCard key={review.id} review={review} />)
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
