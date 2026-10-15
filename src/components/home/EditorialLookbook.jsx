import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEditorial } from '../../context/EditorialContext'

/**
 * Ana səhifə zənginləşdirməsi — Editoryal Lookbook.
 * Asimetrik 3'lü grid: orta kart aşağı kayar, yan kartlar farklı en/oranlarda.
 */
export function EditorialLookbook() {
  const { content } = useEditorial()
  const lookbook = content.lookbook

  return (
    <section className="bg-linen-50">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-ink-400">
              {lookbook.eyebrow}
            </p>
            <h2 className="mt-4 font-display text-3xl tracking-[0.02em] text-ink-900 md:text-4xl">
              {lookbook.title}
            </h2>
          </div>
          <span className="hidden text-[10px] uppercase tracking-[0.3em] text-ink-400 md:block">
            {String(lookbook.looks.length).padStart(2, '0')} look
          </span>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
          {lookbook.looks.map((look, index) => (
            <article
              key={look.number}
              className={`group ${index === 1 ? 'md:mt-16' : ''} ${index === 2 ? 'md:mt-8' : ''}`}
            >
              <div className="relative overflow-hidden bg-linen-100">
                <img
                  src={look.image}
                  alt={`Look ${look.number} — ${look.title}`}
                  loading="lazy"
                  className={`w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] ${
                    index === 1 ? 'aspect-[3/4]' : 'aspect-[3/4] md:aspect-[2/3]'
                  }`}
                />
                <span className="absolute left-4 top-4 bg-linen-50/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.25em] text-ink-900 backdrop-blur-sm">
                  Look {look.number}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <h3 className="font-display text-xl tracking-[0.03em] text-ink-900">
                  {look.title}
                </h3>
                <Link
                  to={look.ctaLink || '/katalog'}
                  className="flex shrink-0 items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-ink-500 transition-colors hover:text-clay-600"
                >
                  {look.ctaLabel}
                  <ArrowRight
                    size={13}
                    strokeWidth={1.5}
                    className="transition-transform duration-300 group-hover:translate-x-0.5"
                  />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
