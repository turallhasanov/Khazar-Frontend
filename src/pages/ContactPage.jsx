import { useState } from 'react'
import { ContentGate } from '../components/content/ContentGate.jsx'
import { PageHeader } from '../components/layout/PageHeader'
import { useContentSection } from '../context/SiteContentContext'
import { ApiError } from '../services/api.js'
import { sendContactMessage } from '../services/contentService.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Same limits as POST /api/contact-messages.
const LIMITS = { name: 100, email: 256, message: 4000 }

const labelClass = 'block text-[10px] font-medium uppercase tracking-[0.25em] text-ink-400'
const inputClass =
  'mt-2 w-full border border-ink-900/20 bg-linen-50 px-3.5 py-3 text-sm font-light tracking-wide text-ink-900 outline-none transition-colors placeholder:text-ink-300 focus:border-ink-900'

/** The API names the rejected field in its message, e.g. "Field 'email' is not a valid email address." */
function describeSendError(error) {
  if (!(error instanceof ApiError)) return { message: 'Mesaj göndərilmədi. Bir az sonra yenidən cəhd edin.' }
  if (error.status === 0) return { message: 'Serverə qoşulmaq mümkün olmadı. İnternet bağlantınızı yoxlayın.' }
  if (error.status === 429) return { message: 'Çox sayda mesaj göndərildi. Bir dəqiqə sonra yenidən cəhd edin.' }
  const field = /Field '(\w+)'/.exec(error.message)?.[1]
  if (error.status === 400 && field === 'email') return { field, message: 'E-poçt formatı yanlışdır' }
  if (error.status === 400 && field) return { field, message: 'Bu xananı yoxlayın' }
  return { message: 'Mesaj göndərilmədi. Bir az sonra yenidən cəhd edin.' }
}

/**
 * Əlaqə (/elaqe) — mesajlar POST /api/contact-messages ilə admin panelinin «Mesajlar» bölməsinə düşür.
 * Başlıq və showroom qeydi "contact", telefon / e-poçt / ünvan / iş saatları "site" bölməsindən.
 */
export function ContactPage() {
  return <ContentGate section="contact">{(contact) => <ContactContent contact={contact} />}</ContentGate>
}

function ContactContent({ contact }) {
  const site = useContentSection('site')
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const showroomRows = [
    { label: 'Telefon', value: site?.phone },
    { label: 'E-poçt', value: site?.email },
    { label: 'Ünvan', value: site?.address },
    { label: 'İş saatları', value: site?.workingHours },
  ].filter((row) => row.value)

  const update = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }))
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (sending) return
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = 'Ad boş qala bilməz'
    if (!form.email.trim()) nextErrors.email = 'E-poçt boş qala bilməz'
    else if (!EMAIL_PATTERN.test(form.email.trim())) nextErrors.email = 'E-poçt formatı yanlışdır'
    if (!form.message.trim()) nextErrors.message = 'Mesaj boş qala bilməz'
    setErrors(nextErrors)
    setFormError(null)
    if (Object.keys(nextErrors).length > 0) return

    setSending(true)
    try {
      await sendContactMessage({ name: form.name.trim(), email: form.email.trim(), message: form.message.trim() })
      setSent(true)
    } catch (error) {
      const { field, message } = describeSendError(error)
      if (field) setErrors({ [field]: message })
      else setFormError(message)
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="flex-1">
      <PageHeader eyebrow={contact.header.eyebrow} title={contact.header.title} description={contact.header.description} />

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
                maxLength={LIMITS.name}
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
                maxLength={LIMITS.email}
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
                maxLength={LIMITS.message}
                placeholder="Sualınızı yazın…"
                className={`${inputClass} resize-none ${errors.message ? 'border-clay-600' : ''}`}
              />
              {errors.message && (
                <p className="mt-1.5 text-[11px] text-clay-600">{errors.message}</p>
              )}
            </div>
            {formError && (
              <p role="alert" className="text-[12px] text-clay-600">
                {formError}
              </p>
            )}
            <button
              type="submit"
              disabled={sending}
              className="bg-ink-900 py-4 text-[11px] font-medium uppercase tracking-[0.35em] text-linen-50 transition-colors hover:bg-clay-600 disabled:opacity-60"
            >
              {sending ? 'Göndərilir…' : 'Göndər'}
            </button>
          </form>
        )}

        {/* Showroom məlumatları */}
        <aside className="h-fit border border-linen-200 bg-linen-100/60 p-8">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.35em] text-ink-900">{contact.showroomTitle}</h2>
          {showroomRows.length > 0 && (
            <dl className="mt-7 space-y-5">
              {showroomRows.map((row) => (
                <div key={row.label}>
                  <dt className="text-[10px] uppercase tracking-[0.3em] text-ink-400">{row.label}</dt>
                  <dd className="mt-1 text-sm font-light tracking-[0.05em] text-ink-900">{row.value}</dd>
                </div>
              ))}
            </dl>
          )}
          {contact.showroomNote && (
            <p className="mt-7 border-t border-linen-200 pt-5 text-xs font-light leading-relaxed text-ink-500">
              {contact.showroomNote}
            </p>
          )}
        </aside>
      </section>
    </main>
  )
}
