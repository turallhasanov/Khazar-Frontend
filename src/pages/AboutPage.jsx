import { Link } from 'react-router-dom'
import { ContentGate } from '../components/content/ContentGate.jsx'
import { PageHeader } from '../components/layout/PageHeader'
import { hideBrokenImage } from '../services/imageFallback.js'
import { responsiveImage } from '../services/responsiveImage.js'

/**
 * Haqqımızda (/haqqimizda) — markanın fəlsəfəsi, Bakı–Avropa sintezi, davamlılıq və pambıq keyfiyyəti üzrə
 * editoryal səhifə. Bütün mətn və görsellər admin panelindəki "about" bölməsindən.
 */
export function AboutPage() {
  return <ContentGate section="about">{(about) => <AboutContent about={about} />}</ContentGate>
}

function AboutContent({ about }) {
  const cover = responsiveImage(about.coverImageUrl)

  return (
    <main className="flex-1">
      <PageHeader eyebrow={about.header.eyebrow} title={about.header.title} description={about.header.description} />

      {/* Tam genişlik editoryal kapak */}
      {cover.src && (
        <section className="relative h-[380px] overflow-hidden md:h-[480px]">
          <img
            {...cover}
            onError={hideBrokenImage}
            sizes="100vw"
            alt={about.coverImageAlt}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-ink-900/25" />
          {about.coverCaption && (
            <p className="absolute bottom-6 left-6 text-[10px] uppercase tracking-[0.35em] text-linen-100/90 md:left-10">
              {about.coverCaption}
            </p>
          )}
        </section>
      )}

      {/* Fəlsəfə mətni */}
      {about.quote && (
        <section className="mx-auto max-w-3xl px-6 py-20 text-center md:py-24">
          <p className="font-display text-2xl font-light leading-relaxed tracking-[0.02em] text-ink-900 md:text-3xl">
            &ldquo;{about.quote}&rdquo;
          </p>
          {about.quoteAuthor && (
            <p className="mt-8 text-xs uppercase tracking-[0.3em] text-ink-400">{about.quoteAuthor}</p>
          )}
        </section>
      )}

      {/* Sütunlar: sentez, davamlılıq, pambıq */}
      {about.pillars.length > 0 && (
        <section className="border-y border-linen-200 bg-linen-100">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-3">
            {about.pillars.map((pillar, index) => (
              <div key={index}>
                <span className="font-display text-lg text-clay-600">{String(index + 1).padStart(2, '0')}</span>
                <h2 className="mt-3 text-sm font-medium uppercase tracking-[0.25em] text-ink-900">{pillar.title}</h2>
                <p className="mt-4 text-sm font-light leading-relaxed text-ink-500">{pillar.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      {about.ctaTitle && (
        <section className="mx-auto max-w-4xl px-6 py-20 text-center">
          <p className="text-[10px] uppercase tracking-[0.4em] text-ink-400">{about.ctaEyebrow}</p>
          <h2 className="mt-4 font-display text-3xl font-light text-ink-900">{about.ctaTitle}</h2>
          {about.ctaLabel && (
            <Link
              to={about.ctaLink || '/katalog'}
              className="mt-8 inline-block border border-ink-900 px-10 py-3.5 text-[11px] uppercase tracking-[0.3em] text-ink-900 transition-colors hover:bg-ink-900 hover:text-linen-50"
            >
              {about.ctaLabel}
            </Link>
          )}
        </section>
      )}
    </main>
  )
}
