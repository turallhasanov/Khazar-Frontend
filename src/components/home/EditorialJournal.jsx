import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useContentSection, useSiteContent } from '../../context/SiteContentContext'
import { articlePath } from '../../services/contentService.js'
import { hideBrokenImage } from '../../services/imageFallback.js'
import { Reveal } from '../motion/Reveal.jsx'

/**
 * Ana səhifə zənginləşdirməsi — Editoryal Jurnal. Başlıq "journal" bölməsindən, məqalələr admin panelinin
 * Jurnal səhifəsindən (yalnız dərc olunanlar, panelindəki sıra ilə).
 * Kartsız dergi düzeni: görsel + meta + serif başlık; ikinci məqalə masaüstündə aşağı kayar.
 * Bütün kart bir bağlantıdır — başlıq və "Oxu" eyni yerə gedir, klaviaturada tək dayanacaq.
 */
export function EditorialJournal() {
  const journal = useContentSection('journal')
  const articles = useSiteContent().content?.journal ?? []

  if (!journal || articles.length === 0) return null

  return (
    <section className="bg-linen-50">
      <div className="shell py-24 md:py-32">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">{journal.eyebrow}</p>
            <h2 className="heading-section mt-4">{journal.title}</h2>
          </div>
          <span className="font-display text-lg italic text-ink-500">
            {String(articles.length).padStart(2, '0')} məqalə
          </span>
        </Reveal>

        <div className="mt-14 grid gap-14 md:mt-20 md:grid-cols-2 md:gap-x-10">
          {articles.map((article, index) => (
            <Reveal as="article" key={article.id} delay={(index % 2) * 120} className={index % 2 === 1 ? 'md:mt-24' : ''}>
              <Link to={articlePath(article.slug)} className="group block">
                <div className="overflow-hidden bg-linen-100">
                  <img
                    src={article.coverImageUrl}
                    onError={hideBrokenImage}
                    alt={article.title}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover transition-transform duration-[1400ms] ease-[var(--ease-editorial)] group-hover:scale-[1.03]"
                  />
                </div>
                {article.meta && <p className="eyebrow mt-6">{article.meta}</p>}
                <h3 className="mt-3 font-display text-[clamp(1.5rem,1.2rem+0.9vw,2rem)] font-light leading-snug tracking-[-0.01em] text-ink-900 transition-colors duration-300 group-hover:text-clay-600">
                  {article.title}
                </h3>
                <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-ink-500">{article.excerpt}</p>
                <span className="link-underline mt-6 text-ink-900 group-hover:text-clay-600">
                  Oxu
                  <ArrowUpRight
                    size={14}
                    strokeWidth={1.5}
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
