import { Link } from 'react-router-dom'

/** Sol sütun: kurumsal navigasyon (yalnız mevcut rotalar bağlantılıdır). */
const navLinks = [
  { label: 'HOME', to: '/' },
  { label: 'CATALOGS', to: '/katalog' },
  { label: 'ABOUT KHAZAR', to: null },
  { label: 'SHIPPING', to: null },
  { label: 'CONTACTS', to: null },
]

/** Orta sütun: yalnız hazır giyim kategorileri (Mikro-Aşama 7 filtresiyle eşleşir). */
const categoryLinks = [
  { label: 'HOODIE', query: 'hoodie' },
  { label: 'T-SHIRT', query: 't-shirt' },
  { label: 'PANTS', query: 'salvar' },
  { label: 'SWEATSHIRT', query: 'sweatshirt' },
  { label: 'LONGSLEEVE', query: 'longsleeve' },
  { label: 'COAT', query: 'palto' },
]

const contactRows = [
  { label: 'Telefon', value: '+994 50 555 01 44' },
  { label: 'E-poçt', value: 'hello@khazar.az' },
  { label: 'Ünvan', value: 'Ülviyyə Bünyadova 74, Bakı, Azərbaycan' },
]

const linkClass =
  'block py-1 text-xs uppercase tracking-[0.25em] text-linen-200/60 transition-colors hover:text-linen-50'

/**
 * Mikro-Aşama 3: Footer — koyu zeminli editoryal tasarım.
 * Sol: kurumsal linklər · Orta: hazır geyim kateqoriyaları · Sağ: GET IN TOUCH.
 */
export function Footer() {
  return (
    <footer className="bg-ink-900 text-linen-100">
      <div className="mx-auto max-w-6xl px-6 pb-8 pt-16">
        <div className="grid gap-12 md:grid-cols-[1fr_1fr_1.3fr]">
          {/* Sol: kurumsal navigasyon */}
          <nav aria-label="Korporativ">
            {navLinks.map((link) =>
              link.to ? (
                <Link key={link.label} to={link.to} className={linkClass}>
                  {link.label}
                </Link>
              ) : (
                <span
                  key={link.label}
                  className={`${linkClass} cursor-pointer`}
                  role="link"
                  tabIndex={0}
                >
                  {link.label}
                </span>
              ),
            )}
          </nav>

          {/* Orta: hazır geyim kategorileri */}
          <nav aria-label="Kateqoriyalar">
            {categoryLinks.map((link) => (
              <Link
                key={link.label}
                to={`/katalog?kateqoriya=${link.query}`}
                className={linkClass}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Sağ: iletişim */}
          <div>
            <h2 className="font-display text-3xl tracking-[0.05em] md:text-4xl">
              GET <span className="font-semibold text-clay-400">IN</span> TOUCH
            </h2>
            <dl className="mt-8 space-y-5">
              {contactRows.map((row) => (
                <div key={row.label}>
                  <dt className="text-[10px] uppercase tracking-[0.3em] text-linen-200/50">
                    {row.label}
                  </dt>
                  <dd className="mt-1 text-sm text-linen-100/90">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Alt bar */}
        <div className="mt-14 flex flex-col gap-3 border-t border-linen-50/10 pt-6 text-xs text-linen-200/50 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 Khazar Textile. Bütün hüquqlar qorunur.</span>
          <span className="cursor-pointer uppercase tracking-[0.2em] transition-colors hover:text-linen-100">
            Gizlilik Siyasəti
          </span>
          <span>B2B və B2C müştərilərə xidmət göstərilir</span>
        </div>
      </div>
    </footer>
  )
}
