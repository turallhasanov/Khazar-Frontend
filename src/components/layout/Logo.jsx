/**
 * Khazar emblem: a shopping bag with a "K" inside it. The bag takes the surrounding text colour, the K the site's
 * accent (clay), so it follows the theme tokens instead of carrying colours of its own.
 */
export function LogoMark({ className = '' }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className={className}>
      {/* Bag: rounded body with a handle arc */}
      <path
        d="M7 11h18l1.2 14.2A2 2 0 0 1 24.2 27.4H7.8a2 2 0 0 1-2-2.2L7 11Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M11.5 11V9.5a4.5 4.5 0 0 1 9 0V11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      {/* K */}
      <path
        d="M12.5 15.5v8.5M12.5 20l6.5-4.5M14.4 18.7 19.4 24"
        className="stroke-clay-600"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * Emblem and "KHAZAR" wordmark, aligned on one row. The optional tagline sits under the wordmark. Rendered inside a
 * link by the caller, so it carries no navigation of its own.
 */
export function Logo({ size = 'md', tagline = false }) {
  // The header's centre column shares its row with the nav and the account links, so the lockup grows only at lg
  // (1024px); below that it stays compact and cannot squeeze "Giriş / Qeydiyyat" onto two lines.
  const mark = size === 'sm' ? 'h-8 w-8' : 'h-8 w-8 lg:h-10 lg:w-10'
  const word = size === 'sm' ? 'text-lg' : 'text-[1.0625rem] lg:text-2xl'

  return (
    <span className="flex items-center gap-2">
      <LogoMark className={`${mark} shrink-0 text-ink-900`} />
      <span className="flex flex-col leading-none">
        <span className={`font-display font-normal uppercase tracking-[0.16em] text-ink-900 lg:tracking-[0.2em] ${word}`}>
          Khazar
        </span>
        {tagline ? (
          <span className="mt-1 hidden text-[9px] font-medium uppercase tracking-[0.42em] text-ink-500 lg:block">
            Textile
          </span>
        ) : null}
      </span>
    </span>
  )
}
