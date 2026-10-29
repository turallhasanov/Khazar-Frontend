import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useProducts } from '../../context/ProductsContext'
import { useContentSection } from '../../context/SiteContentContext'
import { AccentText } from '../content/AccentText.jsx'
import { Reveal } from '../motion/Reveal.jsx'
import { EditorialStage } from './EditorialStage.jsx'

const STAGE_SIZE = 8

/** "Yeni" işarəli məhsullar önə çıxır; az olarsa kataloqun əvvəlindən tamamlanır. */
function pickArrivals(products) {
  const fresh = products.filter((product) => product.isNew)
  const rest = products.filter((product) => !product.isNew)
  return [...fresh, ...rest].slice(0, STAGE_SIZE)
}

/**
 * Ana səhifə — Yeni gələnlər vitrini (canlı API kataloqu), "Editoryal səhnə" kimi. Başlıq və link admin panelindən.
 * Masaüstündə solda aktiv məhsulun paneli, sağda ekran kənarına qədər səhnə; telefonda səhnə üstdə, panel altda.
 * Kataloq yüklənmədikdə bölmə gizlənir — ana səhifə boş blok göstərmir.
 */
export function NewArrivals() {
  const section = useContentSection('newArrivals')
  const { products, status } = useProducts()
  const arrivals = status === 'ready' ? pickArrivals(products) : []

  if (!section || status === 'error' || (status === 'ready' && arrivals.length === 0)) return null

  return (
    <section className="overflow-hidden border-t border-linen-200 bg-linen-50" aria-labelledby="new-arrivals-title">
      <div className="shell py-20 md:py-28">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">{section.eyebrow}</p>
            <h2 id="new-arrivals-title" className="heading-section mt-4">
              <AccentText text={section.title} className="accent-word" />
            </h2>
          </div>
          {section.linkLabel && (
            <Link to={section.linkTo || '/katalog'} className="link-sweep">
              {section.linkLabel}
              <ArrowRight size={14} strokeWidth={1.5} aria-hidden="true" className="link-sweep-arrow" />
            </Link>
          )}
        </Reveal>

        <Reveal delay={120} className="mt-12 md:mt-16">
          {status === 'loading' ? (
            <div aria-hidden="true" className="grid gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:items-end">
              <div className="aspect-[3/4] w-[82%] animate-pulse bg-linen-100 md:w-[58%] lg:order-2 lg:w-[60%]" />
              <div className="space-y-4 lg:order-1">
                <div className="h-24 w-28 animate-pulse bg-linen-100" />
                <div className="h-8 w-3/4 animate-pulse bg-linen-100" />
                <div className="h-5 w-1/3 animate-pulse bg-linen-100" />
              </div>
            </div>
          ) : (
            <EditorialStage products={arrivals} label="Yeni gələnlər" />
          )}
        </Reveal>
      </div>
    </section>
  )
}
