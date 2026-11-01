import { ContentGate } from '../components/content/ContentGate.jsx'
import { PageHeader } from '../components/layout/PageHeader'

/** Gizlilik Siyasəti (/gizlilik-siyaseti) — bütün mətn admin panelindəki "privacy" bölməsindən. */
export function PrivacyPage() {
  return <ContentGate section="privacy">{(privacy) => <PrivacyContent privacy={privacy} />}</ContentGate>
}

function PrivacyContent({ privacy }) {
  return (
    <main className="flex-1">
      <PageHeader eyebrow={privacy.header.eyebrow} title={privacy.header.title} description={privacy.header.description} />

      <section className="mx-auto max-w-2xl px-6 py-16 md:py-20">
        {privacy.lastUpdated && (
          <p className="mb-10 text-[11px] uppercase tracking-[0.2em] text-ink-400">{privacy.lastUpdated}</p>
        )}
        {privacy.blocks.map((block, index) => (
          <section key={index} className="mt-10 first:mt-0">
            {block.heading && <h2 className="font-display text-2xl tracking-[0.02em] text-ink-900">{block.heading}</h2>}
            {block.paragraphs.filter(Boolean).map((paragraph, paragraphIndex) => (
              <p key={paragraphIndex} className="mt-4 text-[15px] font-light leading-relaxed text-ink-700">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </section>
    </main>
  )
}
