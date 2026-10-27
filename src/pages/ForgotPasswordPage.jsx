import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AuthAlert, AuthField, AuthShell, authButtonClass } from '../components/auth/AuthShell.jsx'
import { useAuth } from '../context/AuthContext'
import { describeAuthError } from '../services/authErrors.js'

/** /sifremi-unutdum — requests a password reset link by email. */
export function ForgotPasswordPage() {
  const { forgotPassword } = useAuth()
  const location = useLocation()
  const [email, setEmail] = useState(location.state?.email ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [sentTo, setSentTo] = useState(null)

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (submitting) return
    const value = email.trim()
    if (!value) {
      setError('E-poçt ünvanını daxil edin.')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await forgotPassword(value)
      setSentTo(value)
    } catch (err) {
      setError(describeAuthError(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Hesab"
      title="Şifrənin bərpası"
      description="Hesabınızın e-poçt ünvanını daxil edin — yeni şifrə təyin etmək üçün link göndərəcəyik."
      footer={
        <Link to="/giris" className="text-ink-900 underline underline-offset-4">
          Daxil olma səhifəsinə qayıt
        </Link>
      }
    >
      {sentTo ? (
        // The API answers the same for unknown addresses, so the message cannot confirm that an account exists.
        <AuthAlert tone="success">
          {sentTo} ünvanı ilə hesab varsa, şifrə bərpası linki göndərildi. Link 30 dəqiqə etibarlıdır.
        </AuthAlert>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <AuthField
            label="E-poçt"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="ad@nümunə.az"
          />
          <AuthAlert>{error}</AuthAlert>
          <button type="submit" disabled={submitting} className={authButtonClass}>
            {submitting ? 'Göndərilir…' : 'Link göndər'}
          </button>
        </form>
      )}
    </AuthShell>
  )
}
