import { Link } from 'react-router-dom'
import faqTopics from '../../assets/faq-topics.jpg'

/**
 * Mikro-Aşama 4: Editoryal slogan bandı + SHIPPING / FAQ TOPICS bilgi blokları.
 * Referanstaki koyu zeminli bölümün uyarlaması.
 */
export function FeatureBand() {
  return (
    <section className="bg-ink-900 text-linen-100">
      {/* Slogan bandı */}
      <div className="mx-auto max-w-4xl px-6 py-16 text-center md:py-20">
        <h2 className="font-display text-2xl leading-snug tracking-[0.06em] md:text-4xl">
          OVERSIZE SWEATSHIRT — <span className="text-clay-400">EUROPEAN</span>
          <br />
          THREE-THREAD — REINFORCED CUFF
          <br />
          ELASTIC — <span className="text-clay-400">LIMITED NUMBER</span>
        </h2>
      </div>

      {/* Bilgi blokları */}
      <div className="mx-auto grid max-w-6xl gap-6 px-6 pb-20 md:grid-cols-[1fr_1.6fr]">
        <div className="flex flex-col justify-between border border-linen-50/15 p-8">
          <div>
            <h3 className="font-display text-xl tracking-[0.1em]">SHIPPING</h3>
            <p className="mt-4 text-sm leading-relaxed text-linen-200/60">
              Bakı daxili 1-2 iş günü, regionlara 3-5 iş günü ərzində çatdırılma.
              150 ₼ üzəri sifarişlərdə çatdırılma pulsuzdur.
            </p>
          </div>
          <Link
            to="/katalog"
            className="mt-8 inline-block text-[10px] uppercase tracking-[0.3em] text-linen-100 underline-offset-4 hover:underline"
          >
            Ətraflı
          </Link>
        </div>

        <div className="grid border border-linen-50/15 sm:grid-cols-2">
          <div className="flex flex-col justify-between p-8">
            <div>
              <h3 className="font-display text-xl tracking-[0.1em]">FAQ TOPICS</h3>
              <p className="mt-4 text-sm leading-relaxed text-linen-200/60">
                Ölçü cədvəli, parça qayğısı və geri qaytarma şərtləri haqqında
                tez-tez verilən suallar.
              </p>
            </div>
            <Link
              to="/katalog"
              className="mt-8 inline-block text-[10px] uppercase tracking-[0.3em] text-linen-100 underline-offset-4 hover:underline"
            >
              Ətraflı
            </Link>
          </div>
          <img
            src={faqTopics}
            alt="Khazar örgü kolleksiyası"
            className="h-48 w-full object-cover sm:h-full"
          />
        </div>
      </div>
    </section>
  )
}
