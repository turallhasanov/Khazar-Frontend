import { apiClient } from './api.js'
import { clearSession, getSession, setSession } from './authSession.js'

/**
 * Auth adapter for the Khazar WebAPI (/api/auth). Failures throw ApiError; `error.code` carries the API's
 * errorCode, e.g. "email_not_confirmed", "invalid_credentials", "verification_code_expired".
 */

const post = (path, body) =>
  apiClient(`/auth${path}`, { method: 'POST', body: JSON.stringify(body), auth: false })

/** POST /auth/register — creates an unconfirmed account and emails a 6-digit code. Returns RegisterResponseDto. */
export function register({ firstName, lastName, email, password }) {
  return post('/register', { firstName, lastName, email, password })
}

/** POST /auth/verify-email — confirms the address and signs the user in. Returns the stored session. */
export async function verifyEmail({ email, code }) {
  return setSession(await post('/verify-email', { email, code }))
}

/** POST /auth/resend-verification — emails a new code; the previous one stops working. */
export function resendVerification(email) {
  return post('/resend-verification', { email })
}

/** POST /auth/login — returns the stored session. Unconfirmed addresses fail with code "email_not_confirmed". */
export async function login({ email, password }) {
  return setSession(await post('/login', { email, password }))
}

/** POST /auth/logout — revokes the refresh token. The local session is cleared even when the API is unreachable. */
export async function logout() {
  const session = getSession()
  clearSession()
  if (!session) return
  try {
    await post('/logout', { refreshToken: session.refreshToken })
  } catch (error) {
    console.warn('[Khazar] Logout could not reach the API; the refresh token expires on its own.', error)
  }
}

/** GET /auth/me — the signed-in user, validated by the API. */
export function getCurrentUser({ signal } = {}) {
  return apiClient('/auth/me', { signal })
}
