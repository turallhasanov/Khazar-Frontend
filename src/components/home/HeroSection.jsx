import { Link } from 'react-router-dom'
import heroMain from '../../assets/hero-main.jpg'
import heroSide from '../../assets/hero-side.jpg'

const sizes = ['XS', 'S', 'M', 'L', 'XL']

const colors = [
  { name: 'Boz', hex: '#9a9a94' },
  { name: 'Bej', hex: '#d8cbb4' },
  { name: 'Qara', hex: '#26241f' },
]

const detailRows = [
  { label: 'QİYMƏT', value: '84,00 ₼' },
  { label: 'ÖLÇÜ', value: sizes.join(' · ') },
]

/**
 * Mikro-Aşama 4: Hero Banner — editoryal, minimalist lüks estetik.
 * Sol: ürün detayları, beden/renk rozetleri ve CTA · Sağ: editoryal görseller.
 */
export function HeroSection() {
  return (
    <section className="bg-linen-50">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-16 pt-12 md:grid-cols-2 md:gap-6 md:pt-16">
        {/* Sol: detaylar */}
        <div className="order-2 md:order-1">
          <p className="text-[10px] uppercase tracking-[0.4em] text-ink-400">
            Yeni Kolleksiya — FW 2026
          </p>
          <h1 className="mt-4 font-display leading-[0.95] text-ink-900">
            <span className="block text-lg tracking-[0.3em] text-ink-500">KHAZAR —</span>
            <span className="block text-5xl tracking-tight md:text-6xl">OVERSIZE</span>
            <span className="block text-5xl tracking-tight text-clay-600 md:text-6xl">
              SWEATSHIRT
            </span>
          </h1>

          <dl className="mt-8 space-y-2">
            {detailRows.map((row) => (
              <div key={row.label} className="flex items-baseline gap-4 text-xs">
                <dt className="w-14 shrink-0 uppercase tracking-[0.3em] text-ink-400">
                  {row.label}
                </dt>
                <dd className="tracking-[0.15em] text-ink-700">{row.value}</dd>
              </div>
            ))}
            <div className="flex items-center gap-4 text-xs">
              <dt className="w-14 shrink-0 uppercase tracking-[0.3em] text-ink-400">RƏNG</dt>
              <dd className="flex items-center gap-2">
                {colors.map((color) => (
                  <span
                    key={color.name}
                    title={color.name}
                    className="h-3.5 w-3.5 rounded-full border border-ink-900/20"
                    style={{ backgroundColor: color.hex }}
                  />
                ))}
              </dd>
            </div>
          </dl>

          <Link
            to="/katalog"
            className="mt-10 inline-block rounded-full border border-ink-900 px-8 py-3 text-[11px] font-medium uppercase tracking-[0.3em] text-ink-900 transition-colors hover:bg-ink-900 hover:text-linen-50"
          >
            Ölçü Seç
          </Link>
        </div>

        {/* Sağ: editoryal görseller */}
        <div className="relative order-1 md:order-2">
          <img
            src={heroMain}
            alt="Khazar oversize sweatshirt — editoryal çəkiliş"
            className="mx-auto aspect-[2/3] w-full max-w-md object-cover"
          />
          <img
            src={heroSide}
            alt="Khazar oversize sweatshirt — yan profil"
            className="absolute -bottom-8 -left-2 hidden w-36 border-4 border-linen-50 object-cover shadow-lg md:block lg:w-44"
          />
        </div>
      </div>
    </section>
  )
}
