import { useState } from 'react'
import { PageHeader } from '../components/layout/PageHeader'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const labelClass = 'block text-[10px] font-medium uppercase tracking-[0.25em] text-ink-400'
const inputClass =
  'mt-2 w-full border border-ink-900/20 bg-linen-50 px-3.5 py-3 text-sm font-light tracking-wide text-ink-900 outline-none transition-colors placeholder:text-ink-300 focus:border-ink-900'

const showroomRows = [
  { label: 'Telefon', value: '+994 50 555 01 44' },
  { label: 'E-poçt', value: 'hello@khazar.az' },
  { label: 'Ünvan', value: 'Ülviyyə Bünyadova 74, Bakı, Azərbaycan' },
  { label: 'İş saatları', value: 'B.e. – Şənbə, 10:00 – 20:00' },
]

/**
 * Əlaqə (/elaqe) — minimalist iletişim formu (mock gönderim) +
 * Bakı showroom məlumatları.
 */
export function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)

  const update = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }))
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = 'Ad boş qala bilməz'
    if (!form.email.trim()) nextErrors.email = 'E-poçt boş qala bilməz'
    else if (!EMAIL_PATTERN.test(form.email.trim())) nextErrors.email = 'E-poçt formatı yanlışdır'
    if (!form.message.trim()) nextErrors.message = 'Mesaj boş qala bilməz'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    setSent(true)
  }

  return (
    <main className="flex-1">
      <PageHeader
        eyebrow="Əlaqə"
        title="Bizimlə əlaqə saxlayın"
        description="Sifariş, ölçü və ya kolleksiya haqqında suallarınız üçün yazın — 1 iş günü ərzində cavablandırırıq."
      />

      <section className="mx-auto grid max-w-5xl gap-14 px-6 py-16 md:grid-cols-[1.2fr_1fr] md:py-20">
        {/* Form */}
        {sent ? (
          <div className="flex flex-col items-start gap-4 border border-linen-200 bg-linen-100/60 p-8">
            <h2 className="font-display text-2xl font-light text-ink-900">
              Mesajınız göndərildi
            </h2>
            <p className="text-sm font-light leading-relaxed text-ink-500">
              {form.name.trim()}, müraciətiniz qeydə alındı. {form.email.trim()}{' '}
              ünvanına 1 iş günü ərzində dönüş edəcəyik.
            </p>
            <button
              type="button"
              onClick={() => {
                setForm({ name: '', email: '', message: '' })
                setSent(false)
              }}
              className="mt-2 border border-ink-900 px-8 py-3 text-[11px] uppercase tracking-[0.3em] text-ink-900 transition-colors hover:bg-ink-900 hover:text-linen-50"
            >
              Yeni mesaj yaz
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="grid gap-6">
            <div>
              <label className={labelClass} htmlFor="contact-name">
                Ad
              </label>
              <input
                id="contact-name"
                type="text"
                value={form.name}
                onChange={update('name')}
                placeholder="Adınız"
                className={`${inputClass} ${errors.name ? 'border-clay-600' : ''}`}
              />
              {errors.name && <p className="mt-1.5 text-[11px] text-clay-600">{errors.name}</p>}
            </div>
            <div>
              <label className={labelClass} htmlFor="contact-email">
                E-poçt
              </label>
              <input
                id="contact-email"
                type="email"
                value={form.email}
                onChange={update('email')}
                placeholder="ad@nümunə.az"
                className={`${inputClass} ${errors.email ? 'border-clay-600' : ''}`}
              />
              {errors.email && <p className="mt-1.5 text-[11px] text-clay-600">{errors.email}</p>}
            </div>
            <div>
              <label className={labelClass} htmlFor="contact-message">
                Mesaj
              </label>
              <textarea
                id="contact-message"
                rows={5}
                value={form.message}
                onChange={update('message')}
                placeholder="Sualınızı yazın…"
                className={`${inputClass} resize-none ${errors.message ? 'border-clay-600' : ''}`}
              />
              {errors.message && (
                <p className="mt-1.5 text-[11px] text-clay-600">{errors.message}</p>
              )}
            </div>
            <button
              type="submit"
              className="bg-ink-900 py-4 text-[11px] font-medium uppercase tracking-[0.35em] text-linen-50 transition-colors hover:bg-clay-600"
            >
              Göndər
            </button>
          </form>
        )}

        {/* Showroom məlumatları */}
        <aside className="h-fit border border-linen-200 bg-linen-100/60 p-8">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.35em] text-ink-900">
            Showroom — Bakı
          </h2>
          <dl className="mt-7 space-y-5">
            {showroomRows.map((row) => (
              <div key={row.label}>
                <dt className="text-[10px] uppercase tracking-[0.3em] text-ink-400">
                  {row.label}
                </dt>
                <dd className="mt-1 text-sm font-light tracking-[0.05em] text-ink-900">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-7 border-t border-linen-200 pt-5 text-xs font-light leading-relaxed text-ink-500">
            Showroomda kolleksiyaya canlı baxış və ölçü seçimi mümkündür —
            gəlməzdən əvvəl zəng ilə təsdiq etməyiniz xahiş olunur.
          </p>
        </aside>
      </section>
    </main>
  )
}
