import { AlertCircle, WifiOff, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { registerApiFaultSink } from '../../services/apiFaults.js'

const NOTICE_DURATION_MS = 5000

/**
 * Storefront notification for unexpected API failures (see services/apiFaults.js). One notice per kind at a time:
 * a page that fires several requests while the API is down shows a single message. Inside the admin panel its toasts
 * take over, so this stays silent there.
 */
export function ApiFaultNotice() {
  const [notices, setNotices] = useState([])
  const nextId = useRef(1)

  const dismiss = useCallback((id) => setNotices((current) => current.filter((notice) => notice.id !== id)), [])

  useEffect(
    () =>
      registerApiFaultSink((message, kind) => {
        const id = nextId.current++
        setNotices((current) => (current.some((notice) => notice.kind === kind) ? current : [...current, { id, kind, message }]))
        setTimeout(() => dismiss(id), NOTICE_DURATION_MS)
      }),
    [dismiss],
  )

  if (notices.length === 0) return null

  return (
    <div
      aria-live="assertive"
      className="pointer-events-none fixed inset-x-3 bottom-4 z-[70] flex flex-col items-center gap-2"
    >
      {notices.map((notice) => {
        const Icon = notice.kind === 'network' ? WifiOff : AlertCircle
        return (
          <div
            key={notice.id}
            role="alert"
            className="pointer-events-auto flex w-full max-w-md animate-toast-in items-start gap-3 border border-ink-900/10 bg-linen-50 px-4 py-3 text-sm text-ink-900 shadow-xl shadow-ink-900/10"
          >
            <Icon size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-clay-600" />
            <p className="min-w-0 flex-1 leading-relaxed">{notice.message}</p>
            <button
              type="button"
              aria-label="Bildirişi bağla"
              onClick={() => dismiss(notice.id)}
              className="shrink-0 text-ink-400 transition-colors hover:text-ink-900"
            >
              <X size={14} strokeWidth={1.5} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
