import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AuthAlert, AuthField, AuthShell, authButtonClass } from '../components/auth/AuthShell.jsx'
import { useAuth } from '../context/AuthContext'
import { describeAuthError } from '../services/authErrors.js'

/** Same rule as the API: at least 8 characters with a letter and a digit. */
function isStrongPassword(password) {
  return password.length >= 8 && /\p{L}/u.test(password) && /\d/.test(password)
}

/** /sifre-yenile?email=…&token=… — opened from the reset email; sets a new password. */
export function ResetPasswordPage() {
  const { resetPassword } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') ?? ''
  const token = searchParams.get('token') ?? ''
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))

  if (!email || !token) {
    return (
      <AuthShell
        eyebrow="Hesab"
        title="Link etibarsızdır"
        description="Şifrə bərpası linki natamamdır. E-poçtdakı linki tam açın və ya yeni link istəyin."
        footer={
          <Link to="/sifremi-unutdum" className="text-ink-900 underline underline-offset-4">
            Yeni link istə
          </Link>
        }
      />
    )
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (submitting) return
    if (!isStrongPassword(form.password)) {
      setError('Şifrə ən azı 8 simvol olmalı, hərf və rəqəm ehtiva etməlidir.')
      return
    }
    if (form.password !== form.confirm) {
      setError('Şifrələr eyni deyil.')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await resetPassword({ email, token, newPassword: form.password })
      navigate('/giris', {
        replace: true,
        state: { email, notice: 'Şifrəniz yeniləndi. Yeni şifrə ilə daxil olun.' },
      })
    } catch (err) {
      setError(describeAuthError(err))
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Hesab"
      title="Yeni şifrə"
      description={`${email} hesabı üçün yeni şifrə təyin edin.`}
      footer={
        <Link to="/sifremi-unutdum" className="text-ink-900 underline underline-offset-4">
          Yeni link istə
        </Link>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <AuthField
          label="Yeni şifrə"
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={update('password')}
        />
        <AuthField
          label="Şifrəni təkrarlayın"
          type="password"
          autoComplete="new-password"
          value={form.confirm}
          onChange={update('confirm')}
        />
        <AuthAlert>{error}</AuthAlert>
        <button type="submit" disabled={submitting} className={authButtonClass}>
          {submitting ? 'Yadda saxlanılır…' : 'Şifrəni yenilə'}
        </button>
      </form>
    </AuthShell>
  )
}
