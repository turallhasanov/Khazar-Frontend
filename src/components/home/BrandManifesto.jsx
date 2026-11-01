import { useContentSection } from '../../context/SiteContentContext'
import { Reveal } from '../motion/Reveal.jsx'
import { AccentLine } from './FeatureBand'

/**
 * Ana səhifə zənginləşdirməsi — Brend Manifesti ("manifesto" bölməsi, admin panelindən).
 * Krem-2 zemin, geniş serif başlık (vurğu: *...* → italik terracotta) + ensiz sütunda sans paragraflar.
 * Masaüstündə asimetrik: başlıq 7, mətn 4 sütun, aralarında incə dikey xətt.
 */
export function BrandManifesto() {
  const manifesto = useContentSection('manifesto')
  if (!manifesto) return null

  return (
    <section className="bg-linen-100">
      <div className="shell grid gap-12 py-24 md:py-32 lg:grid-cols-12 lg:gap-10">
        <Reveal className="lg:col-span-7">
          <p className="eyebrow">{manifesto.eyebrow}</p>
          <h2 className="mt-8 font-display text-[clamp(2.5rem,1.4rem+3.6vw,4.75rem)] font-light leading-[1.02] tracking-[-0.025em] text-ink-900">
            {manifesto.title.split('\n').map((line, index) => (
              <span key={index} className="block">
                <AccentLine text={line} />
              </span>
            ))}
          </h2>
        </Reveal>

        <Reveal
          delay={150}
          className="flex flex-col justify-end gap-6 lg:col-span-4 lg:col-start-9 lg:border-l lg:border-linen-200 lg:pl-10"
        >
          {manifesto.paragraphs.filter(Boolean).map((paragraph, index) => (
            <p
              key={index}
              className={index === 0 ? 'text-lg leading-relaxed text-ink-700' : 'text-[15px] leading-relaxed text-ink-500'}
            >
              {paragraph}
            </p>
          ))}
          {manifesto.signature && <p className="mt-4 font-display text-lg italic text-clay-700">{manifesto.signature}</p>}
        </Reveal>
      </div>
    </section>
  )
}
