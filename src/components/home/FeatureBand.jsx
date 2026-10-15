import { Link } from 'react-router-dom'
import faqTopics from '../../assets/faq-topics.jpg'
import { useEditorial } from '../../context/EditorialContext'

/**
 * Slogan satırı — *...* ile işaretlenen bölümler vurgu (clay) renginde
 * gösterilir; HTML kullanılmaz, CMS metni düz metin olarak düzenlenir.
 */
function AccentLine({ text }) {
  return text.split('*').map((part, index) =>
    index % 2 === 1 ? (
      <span key={index} className="text-clay-400">
        {part}
      </span>
    ) : (
      <span key={index}>{part}</span>
    ),
  )
}

/**
 * Mikro-Aşama 4: Editoryal slogan bandı + SHIPPING / FAQ TOPICS bilgi blokları.
 * Referanstaki koyu zeminli bölümün uyarlaması — içərik EditorialContext-dən.
 */
export function FeatureBand() {
  const { content } = useEditorial()
  const { shipping, faq } = content.featureBlocks
  const faqImage = faq.imageUrl.trim() ? faq.imageUrl : faqTopics

  return (
    <section className="bg-ink-900 text-linen-100">
      {/* Slogan bandı */}
      <div className="mx-auto max-w-4xl px-6 py-16 text-center md:py-20">
        <h2 className="font-display text-2xl leading-snug tracking-[0.06em] md:text-4xl">
          {content.slogan.lines.map((line, index) => (
            <span key={index}>
              {index > 0 && <br />}
              <AccentLine text={line} />
            </span>
          ))}
        </h2>
      </div>

      {/* Bilgi blokları */}
      <div className="mx-auto grid max-w-6xl gap-6 px-6 pb-20 md:grid-cols-[1fr_1.6fr]">
        <div className="flex flex-col justify-between border border-linen-50/15 p-8">
          <div>
            <h3 className="font-display text-xl tracking-[0.1em]">{shipping.title}</h3>
            <p className="mt-4 text-sm leading-relaxed text-linen-200/60">{shipping.text}</p>
          </div>
          <Link
            to={shipping.linkTo || '/katalog'}
            className="mt-8 inline-block text-[10px] uppercase tracking-[0.3em] text-linen-100 underline-offset-4 hover:underline"
          >
            {shipping.linkLabel}
          </Link>
        </div>

        <div className="grid border border-linen-50/15 sm:grid-cols-2">
          <div className="flex flex-col justify-between p-8">
            <div>
              <h3 className="font-display text-xl tracking-[0.1em]">{faq.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-linen-200/60">{faq.text}</p>
            </div>
            <Link
              to={faq.linkTo || '/katalog'}
              className="mt-8 inline-block text-[10px] uppercase tracking-[0.3em] text-linen-100 underline-offset-4 hover:underline"
            >
              {faq.linkLabel}
            </Link>
          </div>
          <img
            src={faqImage}
            alt="Khazar vitrin görseli"
            className="h-48 w-full object-cover sm:h-full"
          />
        </div>
      </div>
    </section>
  )
}
