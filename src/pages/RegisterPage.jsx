import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AuthAlert, AuthField, AuthShell, authButtonClass } from '../components/auth/AuthShell.jsx'
import { useAuth } from '../context/AuthContext'
import { describeAuthError } from '../services/authErrors.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Mirrors the API rule, so most weak passwords are caught before the request.
const isStrongPassword = (value) => value.length >= 8 && /\p{L}/u.test(value) && /\d/.test(value)

function validate(form) {
  const errors = {}
  if (!form.firstName.trim()) errors.firstName = 'Ad boş qala bilməz'
  if (!form.lastName.trim()) errors.lastName = 'Soyad boş qala bilməz'
  if (!form.email.trim()) errors.email = 'E-poçt boş qala bilməz'
  else if (!EMAIL_PATTERN.test(form.email.trim())) errors.email = 'E-poçt formatı yanlışdır'
  if (!isStrongPassword(form.password)) errors.password = 'Ən azı 8 simvol, hərf və rəqəm'
  if (form.confirmPassword !== form.password) errors.confirmPassword = 'Şifrələr eyni deyil'
  return errors
}

/** /qeydiyyat — creates an account; the API emails a 6-digit code that /e-poct-tesdiqi confirms. */
export function RegisterPage() {
  const { register, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  if (isAuthenticated) return <Navigate to="/" replace />

  const update = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }))
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
      const result = await register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
      })
      navigate(`/e-poct-tesdiqi?email=${encodeURIComponent(result.email)}`, {
        state: {
          from: location.state?.from,
          notice: result.verificationEmailSent
            ? `Təsdiq kodu ${result.email} ünvanına göndərildi.`
            : 'Hesab yaradıldı, lakin e-poçt göndərilmədi. "Kodu yenidən göndər" düyməsini sınayın.',
        },
      })
    } catch (error) {
      setSubmitError(describeAuthError(error))
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Hesab"
      title="Qeydiyyat"
      description="Hesab yaradın — e-poçtunuza 6 rəqəmli təsdiq kodu göndəriləcək."
      footer={
        <>
          Artıq hesabınız var?{' '}
          <Link to="/giris" state={location.state} className="text-ink-900 underline underline-offset-4">
            Daxil olun
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <AuthField label="Ad" autoComplete="given-name" value={form.firstName} onChange={update('firstName')} error={errors.firstName} />
          <AuthField label="Soyad" autoComplete="family-name" value={form.lastName} onChange={update('lastName')} error={errors.lastName} />
        </div>
        <AuthField
          label="E-poçt"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={update('email')}
          placeholder="ad@nümunə.az"
          error={errors.email}
        />
        <AuthField
          label="Şifrə"
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={update('password')}
          error={errors.password}
        />
        <AuthField
          label="Şifrəni təkrarlayın"
          type="password"
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={update('confirmPassword')}
          error={errors.confirmPassword}
        />
        <AuthAlert>{submitError}</AuthAlert>
        <button type="submit" disabled={submitting} className={authButtonClass}>
          {submitting ? 'Göndərilir…' : 'Hesab yarat'}
        </button>
      </form>
    </AuthShell>
  )
}
