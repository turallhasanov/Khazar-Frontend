/** Shared frame and form controls of the login, register and email verification pages. */

export const authLabelClass = 'block text-[10px] font-medium uppercase tracking-[0.25em] text-ink-400'
export const authInputClass =
  'mt-2 w-full border bg-linen-50 px-3.5 py-3 text-sm tracking-wide text-ink-900 outline-none transition-colors placeholder:text-ink-300 focus:border-ink-900'
export const authButtonClass =
  'w-full bg-ink-900 px-10 py-3.5 text-[11px] uppercase tracking-[0.3em] text-linen-50 transition-colors hover:bg-ink-700 disabled:cursor-not-allowed disabled:opacity-60'

export function AuthShell({ eyebrow, title, description, children, footer }) {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-20">
      <div className="w-full max-w-md border border-linen-200 bg-linen-100/60 px-8 py-12">
        <p className="text-center text-[10px] font-medium uppercase tracking-[0.45em] text-ink-400">{eyebrow}</p>
        <h1 className="mt-4 text-center font-display text-3xl text-ink-900">{title}</h1>
        {description && (
          <p className="mx-auto mt-3 max-w-xs text-center text-sm leading-relaxed text-ink-500">{description}</p>
        )}
        <div className="mt-10">{children}</div>
        {footer && <div className="mt-8 border-t border-linen-200 pt-6 text-center text-sm text-ink-500">{footer}</div>}
      </div>
    </main>
  )
}

export function AuthField({ label, error, ...inputProps }) {
  return (
    <div>
      <label className={authLabelClass}>
        {label}
        <input
          {...inputProps}
          className={`${authInputClass} ${error ? 'border-clay-600' : 'border-ink-900/20'}`}
        />
      </label>
      {error && <p className="mt-1.5 text-[11px] text-clay-600">{error}</p>}
    </div>
  )
}

export function AuthAlert({ tone = 'error', children }) {
  if (!children) return null
  const toneClass = tone === 'error' ? 'border-clay-600/40 text-clay-600' : 'border-sage-600/40 text-sage-600'
  return (
    <p role={tone === 'error' ? 'alert' : 'status'} className={`border px-4 py-3 text-xs leading-relaxed ${toneClass}`}>
      {children}
    </p>
  )
}
