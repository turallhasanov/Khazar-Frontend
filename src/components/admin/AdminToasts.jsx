import { AlertCircle, Check, Info, X } from 'lucide-react'
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

const TOAST_DURATION_MS = 5000

const TONES = {
  success: { icon: Check, className: 'text-sage-600' },
  error: { icon: AlertCircle, className: 'text-clay-600' },
  info: { icon: Info, className: 'text-ink-500' },
}

const ToastContext = createContext(null)

/**
 * Admin notifications, bottom right. `toast({ message, tone, action })` — `action` ({ label, onClick })
 * adds a button such as "Geri al"; the toast closes after the action runs.
 */
export function AdminToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const nextId = useRef(1)

  const dismiss = useCallback((id) => setToasts((current) => current.filter((toast) => toast.id !== id)), [])

  const toast = useCallback(
    ({ message, tone = 'success', action = null }) => {
      const id = nextId.current++
      setToasts((current) => [...current.slice(-2), { id, message, tone, action }])
      setTimeout(() => dismiss(id), TOAST_DURATION_MS)
    },
    [dismiss],
  )

  const value = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Kept clear of the review panel's action buttons: top on phones, bottom left (opposite the panel) above. */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-3 top-3 z-[60] flex flex-col gap-2 sm:inset-x-auto sm:bottom-4 sm:left-4 sm:top-auto sm:w-96"
      >
        {toasts.map((item) => {
          const tone = TONES[item.tone] ?? TONES.info
          const Icon = tone.icon
          return (
            <div
              key={item.id}
              role={item.tone === 'error' ? 'alert' : 'status'}
              className="pointer-events-auto flex animate-toast-in items-start gap-3 border border-ink-900/10 bg-linen-50 px-4 py-3 text-sm text-ink-900 shadow-xl shadow-ink-900/10"
            >
              <Icon size={16} strokeWidth={1.75} className={`mt-0.5 shrink-0 ${tone.className}`} />
              <p className="min-w-0 flex-1 leading-relaxed">{item.message}</p>
              {item.action && (
                <button
                  type="button"
                  onClick={() => {
                    dismiss(item.id)
                    item.action.onClick()
                  }}
                  className="shrink-0 text-[10px] font-medium uppercase tracking-[0.25em] text-clay-600 underline-offset-4 hover:underline"
                >
                  {item.action.label}
                </button>
              )}
              <button
                type="button"
                aria-label="Bildirişi bağla"
                onClick={() => dismiss(item.id)}
                className="shrink-0 text-ink-400 transition-colors hover:text-ink-900"
              >
                <X size={14} strokeWidth={1.5} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

// oxlint-disable-next-line react/only-export-components -- provider + hook birlikte tutulur
export function useAdminToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useAdminToast must be used within an AdminToastProvider')
  return context
}
