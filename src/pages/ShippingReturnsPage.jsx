import { Link } from 'react-router-dom'
import { ContentGate } from '../components/content/ContentGate.jsx'
import { PageHeader } from '../components/layout/PageHeader'

/**
 * Çatdırılma və İadə (/catdirilma-ve-iade) — kuryer müddətləri və iadə prosedurları üzrə editoryal səhifə.
 * Cədvəl, qeyd və addımlar admin panelindəki "shipping" bölməsindən.
 */
export function ShippingReturnsPage() {
  return <ContentGate section="shipping">{(shipping) => <ShippingContent shipping={shipping} />}</ContentGate>
}

function ShippingContent({ shipping }) {
  return (
    <main className="flex-1">
      <PageHeader
        eyebrow={shipping.header.eyebrow}
        title={shipping.header.title}
        description={shipping.header.description}
      />

      {/* Çatdırılma cədvəli */}
      {shipping.deliveryRows.length > 0 && (
        <section className="mx-auto max-w-4xl px-6 py-16 md:py-20">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.35em] text-ink-400">{shipping.deliveryTitle}</h2>
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
                {shipping.deliveryRows.map((row, index) => (
                  <tr key={index} className="border-b border-linen-200 text-sm font-light text-ink-700">
                    <td className="py-4 pr-4 tracking-[0.05em]">{row.region}</td>
                    <td className="py-4 pr-4">{row.time}</td>
                    <td className="py-4">{row.fee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {shipping.deliveryNote && (
            <p className="mt-5 text-sm font-light leading-relaxed text-ink-500">{shipping.deliveryNote}</p>
          )}
        </section>
      )}

      {/* İadə proseduru */}
      {shipping.returnSteps.length > 0 && (
        <section className="border-y border-linen-200 bg-linen-100">
          <div className="mx-auto max-w-4xl px-6 py-16 md:py-20">
            <h2 className="text-[11px] font-medium uppercase tracking-[0.35em] text-ink-400">{shipping.returnsTitle}</h2>
            <div className="mt-8 grid gap-10 md:grid-cols-3">
              {shipping.returnSteps.map((step, index) => (
                <div key={index}>
                  <span className="font-display text-lg text-clay-600">{String(index + 1).padStart(2, '0')}</span>
                  <h3 className="mt-2 text-sm font-medium uppercase tracking-[0.2em] text-ink-900">{step.title}</h3>
                  <p className="mt-3 text-sm font-light leading-relaxed text-ink-500">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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
