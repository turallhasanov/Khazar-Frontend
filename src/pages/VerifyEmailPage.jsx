import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { AuthAlert, AuthField, AuthShell, authButtonClass } from '../components/auth/AuthShell.jsx'
import { useAuth } from '../context/AuthContext'
import { describeAuthError } from '../services/authErrors.js'

// Client-side pause between resends; the API also rate-limits auth requests per IP.
const RESEND_COOLDOWN_SECONDS = 60

/** /e-poct-tesdiqi?email=… — confirms the address with the emailed 6-digit code, which also signs the user in. */
export function VerifyEmailPage() {
  const { verifyEmail, resendVerification } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState(searchParams.get('email') ?? '')
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(location.state?.notice ?? null)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return undefined
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (submitting) return
    if (!email.trim() || !/^\d{6}$/.test(code)) {
      setError('E-poçt ünvanını və 6 rəqəmli kodu daxil edin.')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await verifyEmail({ email: email.trim(), code })
      navigate(location.state?.from ?? '/', { replace: true })
    } catch (err) {
      if (err.code === 'email_already_confirmed') {
        navigate('/giris', { state: { email: email.trim() } })
        return
      }
      setError(describeAuthError(err))
      setSubmitting(false)
    }
  }

  const handleResend = async () => {
    if (!email.trim() || cooldown > 0) {
      if (!email.trim()) setError('Kodu göndərmək üçün e-poçt ünvanını daxil edin.')
      return
    }
    setError(null)
    setCooldown(RESEND_COOLDOWN_SECONDS)
    try {
      await resendVerification(email.trim())
      setCode('')
      setNotice(`Yeni təsdiq kodu ${email.trim()} ünvanına göndərildi.`)
    } catch (err) {
      setError(describeAuthError(err))
    }
  }

  return (
    <AuthShell
      eyebrow="Hesab"
      title="E-poçt təsdiqi"
      description="E-poçtunuza göndərilən 6 rəqəmli kodu daxil edin. Kod 15 dəqiqə etibarlıdır."
      footer={
        <Link to="/giris" className="text-ink-900 underline underline-offset-4">
          Daxil olma səhifəsinə qayıt
        </Link>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <AuthAlert tone="success">{notice}</AuthAlert>
        <AuthField
          label="E-poçt"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <AuthField
          label="Təsdiq kodu"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="000000"
        />
        <AuthAlert>{error}</AuthAlert>
        <button type="submit" disabled={submitting} className={authButtonClass}>
          {submitting ? 'Yoxlanılır…' : 'Təsdiqlə'}
        </button>
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0}
          className="w-full text-[11px] uppercase tracking-[0.25em] text-ink-500 transition-colors hover:text-ink-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {cooldown > 0 ? `Kodu yenidən göndər (${cooldown})` : 'Kodu yenidən göndər'}
        </button>
      </form>
    </AuthShell>
  )
}
