/**
 * Statik/editoryal sayfalar için ortak başlık bloğu —
 * eyebrow + iri incə serif başlık + kısa editoryal açıklama, krem-2 zeminde.
 */
export function PageHeader({ eyebrow, title, description }) {
  return (
    <section className="border-b border-linen-200 bg-linen-100">
      <div className="shell max-w-4xl animate-fade-up py-20 text-center md:py-24">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-6 font-display text-[clamp(2.5rem,1.6rem+3vw,4.25rem)] font-light leading-[1.05] tracking-[-0.02em] text-ink-900">
          {title}
        </h1>
        {description && (
          <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-ink-500">{description}</p>
        )}
      </div>
    </section>
  )
}
