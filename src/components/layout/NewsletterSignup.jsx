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
 * "Xəbərlərə abunə ol" — dark glass newsletter box on the footer (POST /api/khazar/subscribe)
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
      <div className="relative overflow-hidden border border-linen-50/10 bg-linen-50/[0.04] px-6 py-10 backdrop-blur-xl md:px-12">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-clay-500/20 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-sage-500/15 blur-3xl" />
        </div>

        <div className="relative grid items-center gap-8 md:grid-cols-[1fr_1.15fr]">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-linen-200/50">Newsletter</p>
            <h2 className="mt-3 font-display text-2xl tracking-[0.03em] text-linen-50 md:text-3xl">
              Xəbərlərə abunə ol
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-linen-200/60">
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
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-linen-200/40"
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
                  className="w-full border border-linen-50/15 bg-ink-900/50 py-3.5 pl-11 pr-4 text-sm text-linen-50 outline-none transition-colors placeholder:text-linen-200/30 focus:border-linen-50/40"
                />
              </label>
              <button
                type="submit"
                disabled={submitting}
                className="group inline-flex items-center justify-center gap-2 bg-linen-50 px-7 py-3.5 text-[11px] font-medium uppercase tracking-[0.3em] text-ink-900 transition-colors hover:bg-clay-400 hover:text-linen-50 disabled:cursor-not-allowed disabled:opacity-60"
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

      {/* Success toast — outside the glass box: a backdrop-filter ancestor would become the containing block of
          this fixed element and clip it. */}
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transition-all duration-500 ${
          toast.visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        {toast.text && (
          <div className="flex items-center gap-3 border border-linen-50/15 bg-ink-900/80 px-5 py-3.5 text-sm text-linen-50 shadow-2xl shadow-ink-900/40 backdrop-blur-xl">
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
