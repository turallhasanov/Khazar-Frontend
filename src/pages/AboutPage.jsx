import { Link } from 'react-router-dom'
import { PageHeader } from '../components/layout/PageHeader'

/** Doğrulanmış Unsplash editoryal çekimi — tam genişlik kapak. */
const COVER_IMAGE =
  'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1600&q=80'

const pillars = [
  {
    number: '01',
    title: 'Bakı × Avropa sentezi',
    text: 'Bakının şərq-qərb estetikasını Avropa parça texnologiyası ilə birləşdiririk: üç iplik toxuma, french terry və yüksək qramajlı pambıq — hamısı Khazar siluetlərinə uyğunlaşdırılır.',
  },
  {
    number: '02',
    title: 'Sürdürülebilirlik',
    text: 'Limited seriya istehsal edirik: artıq stok yox, mövsümi yanma yox. Hər kolleksiya ölçülə bilən miqdarda toxunur və parça qayğısı üçün uzunömürlü dizayn seçirik.',
  },
  {
    number: '03',
    title: 'Pambıq keyfiyyəti',
    text: '220–400 q/m² qramajlı, uzun lifli pambıq seçirik. Fırçalanmış iç səth, möhkəmləndirilmiş yaxa — parça ilk gündə deyil, illərlə keyfiyyət göstərməlidir.',
  },
]

/**
 * Haqqımızda (/haqqimizda) — markanın fəlsəfəsi, Bakı–Avropa sintezi,
 * davamlılıq və pambıq keyfiyyəti üzrə editoryal statik səhifə.
 */
export function AboutPage() {
  return (
    <main className="flex-1">
      <PageHeader
        eyebrow="Khazar Studio"
        title="Az sayda, yaxşı istehsal"
        description="Khazar hazır geyim markası 2026-cı ildə Bakıda qurulub — zamansız siluetlər, Avropa parça texnologiyası və məsuliyyətli istehsal ilə."
      />

      {/* Tam genişlik editoryal kapak */}
      <section className="relative h-[380px] overflow-hidden md:h-[480px]">
        <img
          src={COVER_IMAGE}
          alt="Khazar kolleksiyası — editoryal çəkiliş"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-ink-900/25" />
        <p className="absolute bottom-6 left-6 text-[10px] uppercase tracking-[0.35em] text-linen-100/90 md:left-10">
          FW 2026 — Limited seriya
        </p>
      </section>

      {/* Fəlsəfə mətni */}
      <section className="mx-auto max-w-3xl px-6 py-20 text-center md:py-24">
        <p className="font-display text-2xl font-light leading-relaxed tracking-[0.02em] text-ink-900 md:text-3xl">
          &ldquo;Biz trendlərin arxasınca getmirik. Hər parçanı geyindiyiniz gün
          deyil, illərlə xidmət edəcəyi şəkildə qururuq.&rdquo;
        </p>
        <p className="mt-8 text-xs uppercase tracking-[0.3em] text-ink-400">
          — Khazar Studio, Bakı
        </p>
      </section>

      {/* Üç sütun: sentez, davamlılıq, pambıq */}
      <section className="border-y border-linen-200 bg-linen-100">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-3">
          {pillars.map((pillar) => (
            <div key={pillar.number}>
              <span className="font-display text-lg text-clay-600">{pillar.number}</span>
              <h2 className="mt-3 text-sm font-medium uppercase tracking-[0.25em] text-ink-900">
                {pillar.title}
              </h2>
              <p className="mt-4 text-sm font-light leading-relaxed text-ink-500">
                {pillar.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <p className="text-[10px] uppercase tracking-[0.4em] text-ink-400">Kolleksiya</p>
        <h2 className="mt-4 font-display text-3xl font-light text-ink-900">
          FW &rsquo;26 ilə tanış olun
        </h2>
        <Link
          to="/katalog"
          className="mt-8 inline-block border border-ink-900 px-10 py-3.5 text-[11px] uppercase tracking-[0.3em] text-ink-900 transition-colors hover:bg-ink-900 hover:text-linen-50"
        >
          Kataloqa bax
        </Link>
      </section>
    </main>
  )
}
