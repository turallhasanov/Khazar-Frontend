import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AuthAlert, AuthField, AuthShell, authButtonClass } from '../components/auth/AuthShell.jsx'
import { ApiError } from '../services/api.js'
import { unsubscribe } from '../services/newsletterService.js'

/**
 * /abunelikden-cix?email=… — opened from the link in newsletter emails. Unsubscribing needs a click, so mail
 * scanners that prefetch links do not unsubscribe anyone.
 */
export function UnsubscribePage() {
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState(searchParams.get('email') ?? '')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)

  const handleSubmit = async (event) => {
    event.preventDefault()
    const value = email.trim()
    if (!value || status === 'submitting') {
      if (!value) setError('E-poçt ünvanını daxil edin.')
      return
    }

    setStatus('submitting')
    setError(null)
    try {
      await unsubscribe(value)
      setStatus('done')
    } catch (err) {
      setError(
        err instanceof ApiError && err.code === 'invalid_email'
          ? 'E-poçt ünvanı düzgün deyil.'
          : 'Sorğu göndərilmədi. Bir az sonra yenidən cəhd edin.',
      )
      setStatus('idle')
    }
  }

  return (
    <AuthShell
      eyebrow="Newsletter"
      title="Abunəlikdən çıx"
      description="Khazar xəbər bülleteni məktublarını artıq almaq istəmirsinizsə, təsdiqləyin."
      footer={
        <Link to="/" className="text-ink-900 underline underline-offset-4">
          Ana səhifəyə qayıt
        </Link>
      }
    >
      {status === 'done' ? (
        <AuthAlert tone="success">
          {email.trim()} ünvanı abunəlikdən çıxarıldı. İstənilən vaxt footer-dən yenidən abunə ola bilərsiniz.
        </AuthAlert>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <AuthField
            label="E-poçt"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <AuthAlert>{error}</AuthAlert>
          <button type="submit" disabled={status === 'submitting'} className={authButtonClass}>
            {status === 'submitting' ? 'Göndərilir…' : 'Abunəlikdən çıx'}
          </button>
        </form>
      )}
    </AuthShell>
  )
}
