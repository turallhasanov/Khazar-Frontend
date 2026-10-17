import { useEditorial } from '../../context/EditorialContext'
import { AccentLine } from './FeatureBand'

/**
 * Ana səhifə zənginləşdirməsi — Brend Manifesti.
 * Krem zemin, serif başlık + sans paragraflar; vurgu satırı *...* konvansiyonuyla.
 */
export function BrandManifesto() {
  const { content } = useEditorial()
  const manifesto = content.manifesto

  return (
    <section className="bg-linen-100">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-[1fr_1.4fr] md:py-28">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-ink-400">
            {manifesto.eyebrow}
          </p>
          <h2 className="mt-6 font-display text-4xl leading-[1.05] tracking-[0.02em] text-ink-900 md:text-5xl">
            {manifesto.title.split('\n').map((line, index) => (
              <span key={index} className="block">
                <AccentLine text={line} />
              </span>
            ))}
          </h2>
          <p className="mt-8 text-xs uppercase tracking-[0.3em] text-ink-500">
            {manifesto.signature}
          </p>
        </div>
        <div className="flex flex-col justify-end gap-6">
          {manifesto.paragraphs.map((paragraph, index) => (
            <p
              key={index}
              className={`leading-relaxed text-ink-700 ${
                index === 0 ? 'text-lg' : 'text-sm text-ink-500'
              }`}
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}
