import { Link } from 'react-router-dom'
import { PageHeader } from '../components/layout/PageHeader'

const deliveryRows = [
  { region: 'Bakı daxili', time: '1–2 iş günü', fee: '150 ₼+ pulsuz · digər 5 ₼' },
  { region: 'Abşeron zonası', time: '1–3 iş günü', fee: '150 ₼+ pulsuz · digər 5 ₼' },
  { region: 'Regionlar (rayonlar)', time: '3–5 iş günü', fee: '150 ₼+ pulsuz · digər 5 ₼' },
  { region: 'Ekspress (Bakı)', time: 'Eyni gün', fee: 'Standart +10 ₼' },
]

const returnSteps = [
  {
    number: '01',
    title: 'Müraciət edin',
    text: 'Təhvil aldıqdan sonra 14 gün ərzində hello@khazar.az ünvanına və ya +994 50 555 01 44 nömrəsinə sifariş nömrənizlə yazın.',
  },
  {
    number: '02',
    title: 'Qablaşdırın',
    text: 'Məhsulu orijinal qablaşdırması və parça etiketi ilə birlikdə qaytarın. İstifadə və yuma izi olan məhsullar iadə edilmir.',
  },
  {
    number: '03',
    title: 'Yoxlama və ödəniş',
    text: 'Məhsul 2 iş günü ərzində yoxlanılır və təsdiqdən sonra ödənişiniz eyni üsulla tam geri qaytarılır.',
  },
]

/**
 * Çatdırılma və İadə (/catdirilma-ve-iade) — kurye müddətləri və
 * iadə prosedurları üzrə editoryal statik səhifə.
 */
export function ShippingReturnsPage() {
  return (
    <main className="flex-1">
      <PageHeader
        eyebrow="Xidmət"
        title="Çatdırılma və İadə"
        description="Bakı daxili və regionlar üzrə kurye çatdırılması, pulsuz kurye şərti və 14 günlük iadə proseduru."
      />

      {/* Çatdırılma cədvəli */}
      <section className="mx-auto max-w-4xl px-6 py-16 md:py-20">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.35em] text-ink-400">
          Çatdırılma müddətləri
        </h2>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-ink-900/20 text-[10px] uppercase tracking-[0.25em] text-ink-400">
                <th className="py-3 pr-4 font-medium">Region</th>
                <th className="py-3 pr-4 font-medium">Müddət</th>
                <th className="py-3 font-medium">Məbləğ</th>
              </tr>
            </thead>
            <tbody>
              {deliveryRows.map((row) => (
                <tr
                  key={row.region}
                  className="border-b border-linen-200 text-sm font-light text-ink-700"
                >
                  <td className="py-4 pr-4 tracking-[0.05em]">{row.region}</td>
                  <td className="py-4 pr-4">{row.time}</td>
                  <td className="py-4">{row.fee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-5 text-sm font-light leading-relaxed text-ink-500">
          150 ₼ üzəri bütün sifarişlərdə standart çatdırılma pulsuzdur. Kuryer
          təhvilindən əvvəl SMS ilə xəbərdarlıq olunursunuz.
        </p>
      </section>

      {/* İadə proseduru */}
      <section className="border-y border-linen-200 bg-linen-100">
        <div className="mx-auto max-w-4xl px-6 py-16 md:py-20">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.35em] text-ink-400">
            İadə proseduru — 14 gün
          </h2>
          <div className="mt-8 grid gap-10 md:grid-cols-3">
            {returnSteps.map((step) => (
              <div key={step.number}>
                <span className="font-display text-lg text-clay-600">{step.number}</span>
                <h3 className="mt-2 text-sm font-medium uppercase tracking-[0.2em] text-ink-900">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm font-light leading-relaxed text-ink-500">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-6 py-16 text-center">
        <p className="text-sm font-light text-ink-500">
          Sualınız qaldı?{' '}
          <Link to="/tez-tez-verilen-suallar" className="underline underline-offset-4 hover:text-clay-600">
            FAQ səhifəsinə
          </Link>{' '}
          baxın və ya{' '}
          <Link to="/elaqe" className="underline underline-offset-4 hover:text-clay-600">
            bizimlə əlaqə saxlayın
          </Link>
          .
        </p>
      </section>
    </main>
  )
}
