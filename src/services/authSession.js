/**
 * Persisted sign-in session: the AuthResponseDto of the last login / verify-email / refresh-token call.
 * Kept in localStorage so a reload stays signed in; other tabs see changes through the "storage" event.
 */
const STORAGE_KEY = 'khazar-auth-v1'

const listeners = new Set()

function isValidSession(value) {
  return (
    value &&
    typeof value.accessToken === 'string' &&
    typeof value.refreshToken === 'string' &&
    value.user &&
    typeof value.user.id === 'string'
  )
}

export function getSession() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    return isValidSession(parsed) ? parsed : null
  } catch {
    return null
  }
}

function notify(session) {
  listeners.forEach((listener) => listener(session))
}

/** Stores an AuthResponseDto from the API. */
export function setSession(authResponse) {
  const session = {
    accessToken: authResponse.accessToken,
    accessTokenExpiresAt: authResponse.accessTokenExpiresAt,
    refreshToken: authResponse.refreshToken,
    refreshTokenExpiresAt: authResponse.refreshTokenExpiresAt,
    user: authResponse.user,
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  } catch {
    // Storage full or blocked: the session still works for this page view.
  }
  notify(session)
  return session
}

export function clearSession() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Ignored, see setSession.
  }
  notify(null)
}

/** Calls listener(session | null) whenever the session changes, in this tab or another. Returns an unsubscribe function. */
export function subscribeSession(listener) {
  listeners.add(listener)
  const onStorage = (event) => {
    if (event.key === STORAGE_KEY) listener(getSession())
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}
