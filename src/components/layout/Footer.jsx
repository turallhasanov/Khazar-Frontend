import { Link } from 'react-router-dom'
import { useProducts } from '../../context/ProductsContext'
import { useContentSection } from '../../context/SiteContentContext'
import { AccentText } from '../content/AccentText.jsx'
import { NewsletterSignup } from './NewsletterSignup'

/** Sol sütun: kurumsal navigasyon — saytın səhifələri (marşrutlar koddadır, məzmunları admin panelindən). */
const navLinks = [
  { label: 'HOME', to: '/' },
  { label: 'CATALOGS', to: '/katalog' },
  { label: 'ABOUT KHAZAR', to: '/haqqimizda' },
  { label: 'SHIPPING', to: '/catdirilma-ve-iade' },
  { label: 'FAQ', to: '/tez-tez-verilen-suallar' },
  { label: 'CONTACTS', to: '/elaqe' },
]

const linkClass =
  'block py-1.5 text-[13px] text-linen-200 transition-colors duration-300 hover:text-clay-400'

/**
 * Footer — mürekkep zeminli editoryal kapanış; metinler AA kontrastında (krem çizgi tonu 9.5:1).
 * Üst: xəbər bülleteni abunəliyi · Sol: kurumsal linklər · Orta: kateqoriyalar (GET /api/categories, admin
 * sırası ilə) · Sağ: əlaqə məlumatları və alt sətir ("site" bölməsi, admin panelindən).
 */
export function Footer() {
  const { categories } = useProducts()
  const site = useContentSection('site')
  const contactRows = [
    { label: 'Telefon', value: site?.phone },
    { label: 'E-poçt', value: site?.email },
    { label: 'Ünvan', value: site?.address },
  ].filter((row) => row.value)

  return (
    <footer className="bg-ink-900 text-linen-100">
      <div className="shell pb-10 pt-20 md:pt-24">
        {/* Üst: xəbərlərə abunə ol */}
        <div className="mb-20">
          <NewsletterSignup />
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-12">
          {/* Sol: kurumsal navigasyon */}
          <nav aria-label="Korporativ" className="md:col-span-3">
            <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.18em] text-clay-400">Khazar</p>
            {navLinks.map((link) => (
              <Link key={link.label} to={link.to} className={linkClass}>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Orta: kateqoriyalar */}
          {categories.length > 0 && (
            <nav aria-label="Kateqoriyalar" className="md:col-span-3">
              <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.18em] text-clay-400">Kateqoriyalar</p>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/katalog?kateqoriya=${encodeURIComponent(category.slug)}`}
                  className={`${linkClass} uppercase`}
                >
                  {category.label}
                </Link>
              ))}
            </nav>
          )}

          {/* Sağ: iletişim */}
          <div className="col-span-2 md:col-span-5 md:col-start-8">
            {site?.footerHeading && (
              <h2 className="font-display text-[clamp(2.25rem,1.6rem+2vw,3.5rem)] font-light leading-none tracking-[-0.02em] text-linen-50">
                <AccentText text={site.footerHeading} className="italic text-clay-400" />
              </h2>
            )}
            <dl className="mt-8 grid gap-5 sm:grid-cols-2">
              {contactRows.map((row) => (
                <div key={row.label}>
                  <dt className="text-[11px] font-medium uppercase tracking-[0.16em] text-linen-200/80">
                    {row.label}
                  </dt>
                  <dd className="mt-1 text-[15px] text-linen-50">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Alt bar */}
        <div className="mt-16 flex flex-col gap-3 border-t border-linen-50/15 pt-6 text-xs text-linen-200/80 sm:flex-row sm:items-center sm:justify-between">
          <span>{site?.copyright}</span>
          <span className="uppercase tracking-[0.14em]">
            Gizlilik Siyasəti
          </span>
          <span>{site?.footerNote}</span>
        </div>
      </div>
    </footer>
  )
}
