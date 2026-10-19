import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AuthAlert, AuthField, AuthShell, authButtonClass } from '../components/auth/AuthShell.jsx'
import { useAuth } from '../context/AuthContext'
import { describeAuthError } from '../services/authErrors.js'

/** /giris — sign in with a confirmed email address; unconfirmed accounts are sent to the verification page. */
export function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: location.state?.email ?? '', password: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const redirectTo = location.state?.from ?? '/'

  if (isAuthenticated && !submitting) return <Navigate to={redirectTo} replace />

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (submitting) return
    if (!form.email.trim() || !form.password) {
      setError('E-poçt və şifrəni daxil edin.')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await login({ email: form.email.trim(), password: form.password })
      navigate(redirectTo, { replace: true })
    } catch (err) {
      if (err.code === 'email_not_confirmed') {
        navigate(`/e-poct-tesdiqi?email=${encodeURIComponent(form.email.trim())}`, {
          state: { notice: 'Daxil olmaq üçün əvvəlcə e-poçt ünvanınızı təsdiqləyin.' },
        })
        return
      }
      setError(describeAuthError(err))
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Hesab"
      title="Daxil ol"
      description="Sifarişlərinizi hesabınızda izləmək üçün daxil olun."
      footer={
        <>
          Hesabınız yoxdur?{' '}
          <Link to="/qeydiyyat" state={location.state} className="text-ink-900 underline underline-offset-4">
            Qeydiyyatdan keçin
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <AuthField
          label="E-poçt"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={update('email')}
          placeholder="ad@nümunə.az"
        />
        <AuthField
          label="Şifrə"
          type="password"
          autoComplete="current-password"
          value={form.password}
          onChange={update('password')}
        />
        <AuthAlert>{error}</AuthAlert>
        <button type="submit" disabled={submitting} className={authButtonClass}>
          {submitting ? 'Yoxlanılır…' : 'Daxil ol'}
        </button>
      </form>
    </AuthShell>
  )
}
