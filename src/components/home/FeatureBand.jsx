import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useContentSection } from '../../context/SiteContentContext'
import { hideBrokenImage } from '../../services/imageFallback.js'
import { AccentText } from '../content/AccentText.jsx'
import { Reveal } from '../motion/Reveal.jsx'

/**
 * Slogan satırı — *...* ile işaretlenen bölümler italik vurgu olarak gösterilir;
 * HTML kullanılmaz, CMS metni düz metin olarak düzenlenir. (Manifestoda da yeniden kullanılır.)
 * tone="light": krem zemin — terracotta (AA) · tone="dark": mürekkep zemin — yumuşak şeftali (5.6:1).
 */
export function AccentLine({ text, tone = 'light' }) {
  return <AccentText text={text} className={tone === 'dark' ? 'italic text-clay-400' : 'italic text-clay-600'} />
}

function InfoLink({ to, label }) {
  if (!label) return null
  return (
    <Link to={to || '/katalog'} className="link-underline group mt-auto self-start pt-10 text-linen-50 [--link-hover:var(--color-clay-400)]">
      {label}
      <ArrowRight
        size={14}
        strokeWidth={1.5}
        aria-hidden="true"
        className="transition-transform duration-300 group-hover:translate-x-1"
      />
    </Link>
  )
}

/**
 * Editoryal slogan bandı + SHIPPING / FAQ TOPICS bilgi blokları.
 * Sayfadaki tek koyu bölüm — ritmi kıran bilinçli kontrast anı. İçərik admin panelindən ("slogan" və
 * "featureBlocks" bölmələri); saxlanmamış hissə göstərilmir.
 */
export function FeatureBand() {
  const slogan = useContentSection('slogan')
  const blocks = useContentSection('featureBlocks')
  const lines = slogan?.lines.filter(Boolean) ?? []

  if (lines.length === 0 && !blocks) return null

  return (
    <section className="bg-ink-900 text-linen-100">
      {/* Slogan bandı */}
      {lines.length > 0 && (
        <Reveal className="shell py-20 text-center md:py-28">
          <h2 className="mx-auto max-w-5xl font-display text-[clamp(1.5rem,0.9rem+2.6vw,3.5rem)] font-light leading-[1.15] tracking-[-0.01em]">
            {lines.map((line, index) => (
              <span key={index} className="block">
                <AccentLine text={line} tone="dark" />
              </span>
            ))}
          </h2>
        </Reveal>
      )}

      {/* Bilgi blokları */}
      {blocks && (
        <div className={`shell grid gap-6 pb-20 md:grid-cols-12 md:pb-28 ${lines.length === 0 ? 'pt-20 md:pt-28' : ''}`}>
          <Reveal className="flex flex-col border border-linen-50/15 p-8 md:col-span-5 md:p-10">
            <h3 className="font-display text-2xl font-light tracking-[0.02em] text-linen-50">{blocks.shipping.title}</h3>
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-linen-200">{blocks.shipping.text}</p>
            <InfoLink to={blocks.shipping.linkTo} label={blocks.shipping.linkLabel} />
          </Reveal>

          <Reveal delay={120} className={`grid border border-linen-50/15 md:col-span-7 ${blocks.faq.imageUrl ? 'sm:grid-cols-2' : ''}`}>
            <div className="flex flex-col p-8 md:p-10">
              <h3 className="font-display text-2xl font-light tracking-[0.02em] text-linen-50">{blocks.faq.title}</h3>
              <p className="mt-4 text-[15px] leading-relaxed text-linen-200">{blocks.faq.text}</p>
              <InfoLink to={blocks.faq.linkTo} label={blocks.faq.linkLabel} />
            </div>
            {blocks.faq.imageUrl && (
              <div className="overflow-hidden">
                <img
                  src={blocks.faq.imageUrl}
                  onError={hideBrokenImage}
                  alt={blocks.faq.title}
                  loading="lazy"
                  className="h-56 w-full object-cover object-[60%_30%] sm:h-full"
                />
              </div>
            )}
          </Reveal>
        </div>
      )}
    </section>
  )
}
