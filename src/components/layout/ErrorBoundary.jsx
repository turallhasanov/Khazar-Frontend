import { AlertCircle } from 'lucide-react'
import { Component } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Catches errors thrown while rendering, so one broken screen shows a fallback instead of a blank page. Errors in
 * event handlers and API calls never get here; unexpected API failures are announced by ApiFaultNotice.
 */
class ErrorBoundaryInner extends Component {
  state = { error: null, resetKey: this.props.resetKey }

  static getDerivedStateFromError(error) {
    return { error }
  }

  // Another page was opened (e.g. with the browser's back button): drop the error and try rendering again.
  static getDerivedStateFromProps(props, state) {
    return props.resetKey === state.resetKey ? null : { error: null, resetKey: props.resetKey }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] UI render failed:', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return <ErrorFallback error={this.state.error} />
  }
}

function ErrorFallback({ error }) {
  return (
    <main role="alert" className="flex min-h-screen items-center justify-center bg-linen-50 px-4 py-16 text-ink-900">
      <div className="w-full max-w-lg text-center">
        <AlertCircle size={28} strokeWidth={1.5} className="mx-auto text-clay-600" />
        <p className="mt-6 text-[10px] font-medium uppercase tracking-[0.3em] text-ink-500">Khazar</p>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl">Sistemdə xəta baş verdi</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ink-600">
          Bu səhifə gözlənilmədən dayandı. Səbətiniz və hesabınız təhlükəsizdir: səhifəni yeniləyin və ya ana səhifəyə
          qayıdın.
        </p>
        {import.meta.env.DEV && (
          <pre className="mx-auto mt-6 max-h-40 max-w-md overflow-auto border border-ink-900/10 bg-linen-100 p-3 text-left text-xs text-ink-700">
            {error?.message ?? String(error)}
          </pre>
        )}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full bg-ink-900 px-6 py-3 text-[11px] font-medium uppercase tracking-[0.25em] text-linen-50 transition-colors hover:bg-ink-700 sm:w-auto"
          >
            Səhifəni yenilə
          </button>
          <button
            type="button"
            onClick={() => window.location.assign('/')}
            className="w-full border border-ink-900/20 px-6 py-3 text-[11px] font-medium uppercase tracking-[0.25em] text-ink-900 transition-colors hover:border-ink-900 sm:w-auto"
          >
            Ana səhifəyə qayıt
          </button>
        </div>
      </div>
    </main>
  )
}

export function ErrorBoundary({ children }) {
  const { pathname } = useLocation()
  return <ErrorBoundaryInner resetKey={pathname}>{children}</ErrorBoundaryInner>
}
