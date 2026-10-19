import { Banknote, Check, CreditCard, Landmark, ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FREE_SHIPPING_THRESHOLD } from '../components/cart/CartDrawer'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../services/formatPrice.js'
import { createOrder } from '../services/orderService.js'

const CITIES = ['Bakı', 'Sumqayıt', 'Gəncə', 'Lənkəran', 'Mingəçevir', 'Şəki', 'Quba', 'Naxçıvan']

const COURIER_OPTIONS = [
  { id: 'standard', label: 'Standart çatdırılma', hint: '1–3 iş günü' },
  { id: 'express', label: 'Ekspress çatdırılma', hint: 'Eyni gün · +10 ₼' },
]

const PAYMENT_OPTIONS = [
  { id: 'card', label: 'Bank kartı', hint: 'Visa / Mastercard', icon: CreditCard },
  { id: 'cash', label: 'Qapıda nağd', hint: 'Kuryerə nağd ödəniş', icon: Banknote },
  { id: 'terminal', label: 'Qapıda terminal', hint: 'Kartla qapıda ödəniş', icon: Landmark },
]

const STANDARD_SHIPPING_FEE = 5
const EXPRESS_SURCHARGE = 10

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^[+\d][\d\s()-]{6,}$/

const labelClass = 'block text-[10px] font-medium uppercase tracking-[0.25em] text-ink-400'
const inputClass =
  'mt-2 w-full border bg-linen-50 px-3.5 py-3 text-sm tracking-wide text-ink-900 outline-none transition-colors placeholder:text-ink-300 focus:border-ink-900'
const errorClass = 'mt-1.5 text-[11px] text-clay-600'
const sectionTitleClass =
  'text-[11px] font-medium uppercase tracking-[0.3em] text-ink-900'

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  city: 'Bakı',
  address: '',
  postalCode: '',
  courier: 'standard',
  payment: 'card',
  cardNumber: '',
  cardHolder: '',
  cardExpiry: '',
  cardCvv: '',
}

/** 16 hanəli kart nömrəsini 4-4-4-4 formatına salır. */
function formatCardNumber(value) {
  return value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ')
}

/** AA/İİ formatına salır. */
function formatCardExpiry(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

function validate(form) {
  const errors = {}
  if (!form.firstName.trim()) errors.firstName = 'Ad boş qala bilməz'
  if (!form.lastName.trim()) errors.lastName = 'Soyad boş qala bilməz'
  if (!form.email.trim()) errors.email = 'E-poçt boş qala bilməz'
  else if (!EMAIL_PATTERN.test(form.email.trim())) errors.email = 'E-poçt formatı yanlışdır'
  if (!form.phone.trim()) errors.phone = 'Telefon boş qala bilməz'
  else if (!PHONE_PATTERN.test(form.phone.trim())) errors.phone = 'Telefon formatı yanlışdır'
  if (!form.address.trim()) errors.address = 'Ünvan boş qala bilməz'
  if (!form.postalCode.trim()) errors.postalCode = 'Poçt kodu boş qala bilməz'

  if (form.payment === 'card') {
    if (form.cardNumber.replace(/\D/g, '').length !== 16)
      errors.cardNumber = 'Kart nömrəsi 16 rəqəmli olmalıdır'
    if (!form.cardHolder.trim()) errors.cardHolder = 'Kart üzərindəki ad boş qala bilməz'
    if (!/^\d{2}\/\d{2}$/.test(form.cardExpiry)) errors.cardExpiry = 'AA/İİ formatında daxil edin'
    if (!/^\d{3,4}$/.test(form.cardCvv)) errors.cardCvv = '3 rəqəmli CVV kodu'
  }
  return errors
}

/** Maps a failed POST /orders to a customer-facing message (ProblemDetails status codes). */
function describeOrderError(error) {
  switch (error.status) {
    case 0:
      return 'Serverə qoşulmaq mümkün olmadı. İnternet bağlantınızı yoxlayıb yenidən cəhd edin.'
    case 400:
      return 'Sifariş məlumatlarında xəta var. Formu yoxlayıb yenidən cəhd edin.'
    case 404:
      return 'Səbətinizdəki bəzi məhsullar artıq mövcud deyil. Səbəti yeniləyin.'
    case 409:
      return 'Səbətinizdəki bəzi məhsullar üçün kifayət qədər stok yoxdur. Miqdarı azaldın.'
    default:
      return 'Sifariş yaradılmadı. Bir az sonra yenidən cəhd edin.'
  }
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
      {error && <p className={errorClass}>{error}</p>}
    </div>
  )
}

/**
 * Mikro-Aşama 11: Ödəniş səhifəsi (/odeme) — müştəri, çatdırılma və ödəniş
 * bölmələri, canlı sifariş xülasəsi, form doğrulaması və təsdiq ekranı.
 * Orders are placed with POST /api/v1/orders; the confirmation shows the server's order number
 * and recalculated item total. Card fields are validated locally only and never sent to the API.
 */
export function CheckoutPage() {
  const { items, totalItemsCount, subtotalPrice, discountAmount, clearCart } = useCart()
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [order, setOrder] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const shippingFee =
    subtotalPrice >= FREE_SHIPPING_THRESHOLD
      ? form.courier === 'express'
        ? EXPRESS_SURCHARGE
        : 0
      : STANDARD_SHIPPING_FEE + (form.courier === 'express' ? EXPRESS_SURCHARGE : 0)
  const totalPrice = subtotalPrice + shippingFee

  const update = (key) => (event) => {
    let value = event.target.value
    if (key === 'cardNumber') value = formatCardNumber(value)
    if (key === 'cardExpiry') value = formatCardExpiry(value)
    if (key === 'cardCvv') value = value.replace(/\D/g, '').slice(0, 4)
    setForm((current) => ({ ...current, [key]: value }))
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (submitting) return
    const nextErrors = validate(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    setSubmitError(null)
    try {
      const created = await createOrder({
        customer: {
          type: 'B2C',
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
        },
        shipping: {
          city: form.city,
          address: form.address.trim(),
          postalCode: form.postalCode.trim(),
          courier: form.courier,
        },
        payment: { method: form.payment },
        items,
      })

      setOrder({
        number: `#${created.orderNumber}`,
        // The server total covers items only; shipping is still priced by the storefront.
        total: created.totalAmount + shippingFee,
        itemCount: created.itemCount,
        name: created.customerName,
        city: form.city,
        payment: PAYMENT_OPTIONS.find((option) => option.id === form.payment)?.label ?? '',
        response: created,
      })
      clearCart()
    } catch (error) {
      console.error('[Khazar] Order creation failed:', error)
      setSubmitError(describeOrderError(error))
    } finally {
      setSubmitting(false)
    }
  }

  // Təsdiq ekranı
  if (order) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-24">
        <div className="flex w-full max-w-lg flex-col items-center gap-5 border border-linen-200 bg-linen-100/60 px-8 py-14 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sage-600 text-linen-50">
            <Check size={26} strokeWidth={1.5} />
          </span>
          <h1 className="font-display text-3xl text-ink-900">Sifarişiniz qəbul edildi</h1>
          <p className="text-sm leading-relaxed text-ink-500">
            {order.name} — sifariş nömrəniz{' '}
            <span className="font-medium text-ink-900">{order.number}</span>. {order.city}{' '}
            üzrə {order.payment.toLowerCase()} ilə ödəniləcək. Təsdiq e-poçtunuz göndərildi.
          </p>
          <dl className="mt-2 w-full space-y-2 border-t border-linen-200 pt-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-500">Məhsul sayı</dt>
              <dd className="text-ink-900">{order.itemCount}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-500">Yekun məbləğ</dt>
              <dd className="font-display text-lg text-ink-900">{formatPrice(order.total)}</dd>
            </div>
          </dl>
          <Link
            to="/katalog"
            className="mt-4 border border-ink-900 px-10 py-3.5 text-[11px] uppercase tracking-[0.3em] text-ink-900 transition-colors hover:bg-ink-900 hover:text-linen-50"
          >
            Kataloqa qayıt
          </Link>

          {/* Raw POST /orders response, for development */}
          <details className="mt-8 w-full border border-linen-200 bg-linen-50 text-left">
            <summary className="cursor-pointer px-5 py-3 text-[10px] font-medium uppercase tracking-[0.25em] text-ink-500 transition-colors hover:text-ink-900">
              API cavabı (dev)
            </summary>
            <pre className="max-h-72 overflow-auto border-t border-linen-200 px-5 py-4 text-[11px] leading-relaxed text-ink-700">
              {JSON.stringify(order.response, null, 2)}
            </pre>
          </details>
        </div>
      </main>
    )
  }

  // Boş sepet — ödənişə keçid yoxdur
  if (items.length === 0) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-24">
        <div className="flex flex-col items-center gap-4 text-center">
          <ShoppingBag size={32} strokeWidth={1} className="text-ink-300" />
          <p className="font-display text-3xl text-ink-900">Səbətiniz boşdur</p>
          <p className="max-w-xs text-sm leading-relaxed text-ink-400">
            Ödənişə keçməzdən əvvəl səbətinizə məhsul əlavə edin.
          </p>
          <Link
            to="/katalog"
            className="mt-2 border border-ink-900 px-10 py-3.5 text-[11px] uppercase tracking-[0.3em] text-ink-900 transition-colors hover:bg-ink-900 hover:text-linen-50"
          >
            Kataloqa bax
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="font-display text-3xl text-ink-900">Ödəniş</h1>
        <p className="mt-1.5 text-xs uppercase tracking-[0.25em] text-ink-400">
          {totalItemsCount} məhsul — {formatPrice(totalPrice)}
        </p>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-10 grid items-start gap-12 lg:grid-cols-[1fr_360px]"
        >
          {/* Sol: form bölmələri */}
          <div className="space-y-12">
            {/* Müştəri məlumatları */}
            <section>
              <h2 className={sectionTitleClass}>01 — Müştəri məlumatları</h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Field label="Ad" error={errors.firstName}>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={update('firstName')}
                    placeholder="Rəşad"
                    className={`${inputClass} ${errors.firstName ? 'border-clay-600' : 'border-ink-900/20'}`}
                  />
                </Field>
                <Field label="Soyad" error={errors.lastName}>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={update('lastName')}
                    placeholder="Məmmədov"
                    className={`${inputClass} ${errors.lastName ? 'border-clay-600' : 'border-ink-900/20'}`}
                  />
                </Field>
                <Field label="E-poçt" error={errors.email}>
                  <input
                    type="email"
                    value={form.email}
                    onChange={update('email')}
                    placeholder="ad@nümunə.az"
                    className={`${inputClass} ${errors.email ? 'border-clay-600' : 'border-ink-900/20'}`}
                  />
                </Field>
                <Field label="Telefon" error={errors.phone}>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={update('phone')}
                    placeholder="+994 50 000 00 00"
                    className={`${inputClass} ${errors.phone ? 'border-clay-600' : 'border-ink-900/20'}`}
                  />
                </Field>
              </div>
            </section>

            {/* Çatdırılma */}
            <section>
              <h2 className={sectionTitleClass}>02 — Çatdırılma</h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Field label="Şəhər">
                  <select
                    value={form.city}
                    onChange={update('city')}
                    className={`${inputClass} cursor-pointer border-ink-900/20`}
                  >
                    {CITIES.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Poçt kodu" error={errors.postalCode}>
                  <input
                    type="text"
                    value={form.postalCode}
                    onChange={update('postalCode')}
                    placeholder="AZ 1000"
                    className={`${inputClass} ${errors.postalCode ? 'border-clay-600' : 'border-ink-900/20'}`}
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Ünvan" error={errors.address}>
                    <input
                      type="text"
                      value={form.address}
                      onChange={update('address')}
                      placeholder="Küçə, bina, mənzil"
                      className={`${inputClass} ${errors.address ? 'border-clay-600' : 'border-ink-900/20'}`}
                    />
                  </Field>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {COURIER_OPTIONS.map((option) => {
                  const active = form.courier === option.id
                  return (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setForm((current) => ({ ...current, courier: option.id }))}
                      className={`flex items-center justify-between border px-4 py-3.5 text-left transition-colors ${
                        active
                          ? 'border-ink-900 bg-ink-900 text-linen-50'
                          : 'border-ink-900/20 text-ink-700 hover:border-ink-900'
                      }`}
                    >
                      <span className="text-sm tracking-wide">{option.label}</span>
                      <span
                        className={`text-[10px] uppercase tracking-[0.15em] ${active ? 'text-linen-200' : 'text-ink-400'}`}
                      >
                        {option.hint}
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>

            {/* Ödəniş üsulu */}
            <section>
              <h2 className={sectionTitleClass}>03 — Ödəniş üsulu</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {PAYMENT_OPTIONS.map((option) => {
                  const Icon = option.icon
                  const active = form.payment === option.id
                  return (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setForm((current) => ({ ...current, payment: option.id }))}
                      className={`flex flex-col items-start gap-2 border px-4 py-4 text-left transition-colors ${
                        active
                          ? 'border-ink-900 bg-ink-900 text-linen-50'
                          : 'border-ink-900/20 text-ink-700 hover:border-ink-900'
                      }`}
                    >
                      <Icon size={18} strokeWidth={1.5} />
                      <span className="text-sm tracking-wide">{option.label}</span>
                      <span
                        className={`text-[10px] uppercase tracking-[0.15em] ${active ? 'text-linen-200' : 'text-ink-400'}`}
                      >
                        {option.hint}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Mock kart məlumatları */}
              {form.payment === 'card' && (
                <div className="mt-5 grid gap-5 border border-linen-200 bg-linen-100/60 p-6 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Field label="Kart nömrəsi" error={errors.cardNumber}>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={form.cardNumber}
                        onChange={update('cardNumber')}
                        placeholder="0000 0000 0000 0000"
                        className={`${inputClass} ${errors.cardNumber ? 'border-clay-600' : 'border-ink-900/20'}`}
                      />
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <Field label="Kart üzərindəki ad" error={errors.cardHolder}>
                      <input
                        type="text"
                        value={form.cardHolder}
                        onChange={update('cardHolder')}
                        placeholder="RASHAD MAMMADOV"
                        className={`${inputClass} ${errors.cardHolder ? 'border-clay-600' : 'border-ink-900/20'}`}
                      />
                    </Field>
                  </div>
                  <Field label="Son istifadə tarixi" error={errors.cardExpiry}>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={form.cardExpiry}
                      onChange={update('cardExpiry')}
                      placeholder="AA/İİ"
                      className={`${inputClass} ${errors.cardExpiry ? 'border-clay-600' : 'border-ink-900/20'}`}
                    />
                  </Field>
                  <Field label="CVV" error={errors.cardCvv}>
                    <input
                      type="password"
                      inputMode="numeric"
                      value={form.cardCvv}
                      onChange={update('cardCvv')}
                      placeholder="•••"
                      className={`${inputClass} ${errors.cardCvv ? 'border-clay-600' : 'border-ink-900/20'}`}
                    />
                  </Field>
                </div>
              )}
            </section>
          </div>

          {/* Sağ: sifariş xülasəsi */}
          <aside className="h-fit border border-linen-200 bg-linen-100/60 p-7">
            <h2 className={sectionTitleClass}>Sifariş xülasəsi</h2>

            <ul className="mt-6 space-y-4 border-b border-linen-200 pb-6">
              {items.map((item) => (
                <li key={item.cartItemId} className="flex items-center gap-4">
                  <img src={item.image} alt={item.name} className="h-20 w-16 bg-linen-100 object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-medium tracking-wide text-ink-900">{item.name}</p>
                    <p className="mt-0.5 text-xs text-ink-400">
                      {item.color.name} / {item.size} · {item.quantity} ədəd
                    </p>
                  </div>
                  <p className="text-sm text-ink-900">{formatPrice(item.unitPrice * item.quantity)}</p>
                </li>
              ))}
            </ul>

            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-500">Ara toplam</dt>
                <dd className="text-ink-900">{formatPrice(subtotalPrice + discountAmount)}</dd>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-ink-500">Endirim</dt>
                  <dd className="text-sage-600">−{formatPrice(discountAmount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-ink-500">Çatdırılma</dt>
                <dd className="text-ink-900">
                  {shippingFee === 0 ? 'Pulsuz' : formatPrice(shippingFee)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-linen-200 pt-4">
                <dt className="text-[11px] uppercase tracking-[0.25em] text-ink-900">Yekun</dt>
                <dd className="font-display text-xl text-ink-900">{formatPrice(totalPrice)}</dd>
              </div>
            </dl>

            {submitError && (
              <p role="alert" className="mt-6 border border-clay-600/40 px-4 py-3 text-xs leading-relaxed text-clay-600">
                {submitError}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="mt-6 w-full bg-ink-900 py-4 text-[11px] font-medium uppercase tracking-[0.35em] text-linen-50 transition-colors hover:bg-clay-600 disabled:cursor-wait disabled:opacity-60"
            >
              {submitting ? 'Göndərilir…' : 'Sifarişi təsdiqlə'}
            </button>
            <p className="mt-4 text-center text-[10px] leading-relaxed tracking-wide text-ink-400">
              Demo ödənişdir — kart məlumatları serverə göndərilmir və kart çəkilişi olunmur.
            </p>
          </aside>
        </form>
      </div>
    </main>
  )
}
