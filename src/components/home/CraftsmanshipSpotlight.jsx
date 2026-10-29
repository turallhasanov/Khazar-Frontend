import { useContentSection } from '../../context/SiteContentContext'
import { hideBrokenImage } from '../../services/imageFallback.js'
import { Reveal } from '../motion/Reveal.jsx'

/**
 * Ana səhifə zənginləşdirməsi — Ustalıq Vurgusu ("craftsmanship" bölməsi, admin panelindən).
 * Masaüstü: soldan taşan yakın çekim görsel (6 sütun) + sağda başlık ve numaralı kalite vurguları.
 * Numaralar serif italik terracotta — ikon yerine tipografi taşıyıcı.
 */
export function CraftsmanshipSpotlight() {
  const craft = useContentSection('craftsmanship')
  if (!craft) return null

  return (
    <section className="bg-linen-100">
      <div className="shell grid items-center gap-12 py-24 md:py-32 lg:grid-cols-12 lg:gap-10">
        {craft.imageUrl && (
          <Reveal variant="image" className="relative -mx-5 md:mx-0 lg:col-span-6">
            <img
              src={craft.imageUrl}
              onError={hideBrokenImage}
              alt={craft.imageAlt}
              loading="lazy"
              className="aspect-[4/5] w-full object-cover"
            />
          </Reveal>
        )}

        <div className="lg:col-span-5 lg:col-start-8">
          <Reveal>
            <p className="eyebrow">{craft.eyebrow}</p>
            <h2 className="heading-section mt-5">{craft.title}</h2>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-ink-500">{craft.text}</p>
          </Reveal>

          {craft.highlights.length > 0 && (
            <ol className="mt-12 border-t border-linen-200">
              {craft.highlights.map((highlight, index) => (
                <Reveal
                  as="li"
                  key={index}
                  delay={index * 110}
                  className="grid grid-cols-[3rem_1fr] gap-4 border-b border-linen-200 py-6"
                >
                  <span className="font-display text-2xl font-light italic leading-none text-clay-700">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-normal text-ink-900">{highlight.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{highlight.text}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          )}
        </div>
      </div>
    </section>
  )
}
