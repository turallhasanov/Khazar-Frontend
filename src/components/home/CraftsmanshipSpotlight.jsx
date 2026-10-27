import { Award, Feather, Layers } from 'lucide-react'
import { useEditorial } from '../../context/EditorialContext'
import { hideBrokenImage } from '../../services/imageFallback.js'

const HIGHLIGHT_ICONS = [Layers, Award, Feather]

/**
 * Ana səhifə zənginləşdirməsi — Ustalıq Vurgusu.
 * Yakın çekim görsel + 3 numaralı kalite vurgusu (Toxuma, Davamlılıq, Rahatlıq).
 */
export function CraftsmanshipSpotlight() {
  const { content } = useEditorial()
  const craft = content.craftsmanship

  return (
    <section className="border-y border-linen-200 bg-linen-100">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
        {/* Yakın çekim görsel */}
        <div className="relative">
          <img
            src={craft.image}
            onError={hideBrokenImage}
            alt="Khazar parça detayı — yaxın çəkiliş"
            loading="lazy"
            className="aspect-[4/5] w-full object-cover"
          />
          <span className="absolute bottom-4 left-4 bg-ink-900/85 px-3 py-1.5 text-[10px] uppercase tracking-[0.25em] text-linen-100 backdrop-blur-sm">
            {craft.eyebrow}
          </span>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-ink-400">{craft.eyebrow}</p>
          <h2 className="mt-4 font-display text-3xl leading-tight tracking-[0.02em] text-ink-900 md:text-4xl">
            {craft.title}
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-ink-500">{craft.text}</p>

          <ul className="mt-10 divide-y divide-linen-200 border-y border-linen-200">
            {craft.highlights.map((highlight, index) => {
              const Icon = HIGHLIGHT_ICONS[index % HIGHLIGHT_ICONS.length]
              return (
                <li key={highlight.title} className="flex items-start gap-5 py-5">
                  <span className="font-display text-lg text-clay-600">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="mt-0.5 text-ink-400">
                    <Icon size={18} strokeWidth={1.5} />
                  </span>
                  <div>
                    <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-ink-900">
                      {highlight.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
                      {highlight.text}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
