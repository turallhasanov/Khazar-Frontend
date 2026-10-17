/**
 * Statik/editoryal sayfalar için ortak başlık bloğu —
 * ince eyebrow + serif başlık + kısa editoryal açıklama.
 */
export function PageHeader({ eyebrow, title, description }) {
  return (
    <section className="border-b border-linen-200 bg-linen-100">
      <div className="mx-auto max-w-4xl px-6 py-16 text-center md:py-20">
        <p className="text-[10px] font-medium uppercase tracking-[0.45em] text-ink-400">
          {eyebrow}
        </p>
        <h1 className="mt-5 font-display text-4xl font-light tracking-[0.03em] text-ink-900 md:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mx-auto mt-5 max-w-xl text-sm font-light leading-relaxed text-ink-500">
            {description}
          </p>
        )}
      </div>
    </section>
  )
}
