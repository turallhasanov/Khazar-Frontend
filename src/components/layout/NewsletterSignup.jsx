import { ArrowRight, Check, Mail } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { ApiError } from '../../services/api.js'
import { subscribe } from '../../services/newsletterService.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** The success toast hides itself after this long; the form is usable again right away. */
const TOAST_DURATION_MS = 5000

function describeSubscribeError(error) {
  if (error instanceof ApiError) {
    if (error.code === 'already_subscribed') return { tone: 'info', text: 'Bu e-poçt artıq abunədir.' }
    if (error.code === 'invalid_email') return { tone: 'error', text: 'E-poçt ünvanı düzgün deyil.' }
    if (error.status === 429) return { tone: 'error', text: 'Çox sayda sorğu. Bir az sonra yenidən cəhd edin.' }
    if (error.status === 0) return { tone: 'error', text: 'Serverə qoşulmaq mümkün olmadı.' }
  }
  return { tone: 'error', text: 'Abunəlik alınmadı. Bir az sonra yenidən cəhd edin.' }
}

/**
 * "Xəbərlərə abunə ol" — footer newsletter block with a hairline frame (POST /api/khazar/subscribe)
 * with an instant success toast.
 */
export function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)
  // The text stays after hiding, so the toast fades out instead of disappearing.
  const [toast, setToast] = useState({ visible: false, text: '' })
  const toastTimer = useRef(null)

  useEffect(() => () => window.clearTimeout(toastTimer.current), [])

  const showToast = (text) => {
    window.clearTimeout(toastTimer.current)
    setToast({ visible: true, text })
    toastTimer.current = window.setTimeout(() => setToast((current) => ({ ...current, visible: false })), TOAST_DURATION_MS)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const value = email.trim()
    if (!EMAIL_PATTERN.test(value)) {
      setMessage({ tone: 'error', text: 'Düzgün e-poçt ünvanı daxil edin.' })
      return
    }

    setSubmitting(true)
    setMessage(null)
    try {
      const result = await subscribe(value)
      setEmail('')
      showToast(result?.reactivated ? 'Abunəliyiniz yenidən aktivləşdirildi.' : 'Xəbərlərə uğurla abunə oldunuz!')
    } catch (error) {
      setMessage(describeSubscribeError(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="border-y border-linen-50/15 py-12 md:py-14">
        <div className="grid items-end gap-8 md:grid-cols-[1fr_1.15fr] md:gap-16">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-clay-400">Newsletter</p>
            <h2 className="mt-4 font-display text-[clamp(2rem,1.5rem+1.6vw,3rem)] font-light leading-[1.05] tracking-[-0.02em] text-linen-50">
              Xəbərlərə abunə ol
            </h2>
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-linen-200">
              Yeni kolleksiyalar, limited seriyalar və editoryal hekayələr — ilk siz xəbər tutun.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="relative flex-1">
                <span className="sr-only">E-poçt ünvanı</span>
                <Mail
                  size={16}
                  strokeWidth={1.5}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-linen-200/70"
                />
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    if (message) setMessage(null)
                  }}
                  placeholder="e-poct@nümunə.az"
                  aria-invalid={message?.tone === 'error'}
                  className="w-full border-b border-linen-50/30 bg-transparent py-3.5 pl-8 pr-2 text-[15px] text-linen-50 outline-none transition-colors duration-300 placeholder:text-linen-200/60 focus:border-clay-400 aria-invalid:border-clay-400"
                />
              </label>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary group"
              >
                {submitting ? 'Göndərilir…' : 'Abunə ol'}
                {!submitting && (
                  <ArrowRight size={14} strokeWidth={1.5} className="transition-transform group-hover:translate-x-0.5" />
                )}
              </button>
            </div>

            <div aria-live="polite" className="mt-3 min-h-5 text-xs">
              {message && (
                <p className={message.tone === 'error' ? 'text-clay-400' : 'text-linen-200/70'}>{message.text}</p>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Success toast — kept outside the form block so no transformed ancestor becomes its containing block. */}
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transition-all duration-500 ${
          toast.visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        {toast.text && (
          <div className="flex items-center gap-3 bg-ink-900 px-5 py-3.5 text-sm text-linen-50 shadow-lg shadow-ink-900/20">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sage-500/30 text-sage-100">
              <Check size={13} strokeWidth={2} />
            </span>
            {toast.text}
          </div>
        )}
      </div>
    </>
  )
}
