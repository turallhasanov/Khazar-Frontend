import { clearSession, getSession, setSession } from './authSession.js'

/**
 * Base URL of the Khazar WebAPI endpoints. Override with VITE_API_BASE_URL in .env;
 * the default matches the "http" profile in Khazar.WebAPI/Properties/launchSettings.json.
 */
export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5293/api'
).replace(/\/+$/, '')

/** Access tokens this close to expiry are refreshed before the request instead of failing with 401. */
const REFRESH_MARGIN_MS = 30_000

/**
 * Error thrown for non-2xx responses and network failures.
 * The API returns RFC 7807 ProblemDetails; `problem` holds that body when present
 * and `code` its "errorCode" extension (e.g. "email_not_confirmed").
 */
export class ApiError extends Error {
  constructor(message, { status = 0, problem = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.problem = problem
    this.code = problem?.errorCode ?? null
  }
}

async function readProblem(response) {
  try {
    return await response.json()
  } catch {
    return null
  }
}

async function send(path, init, accessToken) {
  try {
    return await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        // Only requests with a body declare a content type, so GETs stay CORS "simple" requests.
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...init?.headers,
      },
    })
  } catch (error) {
    // Aborts are expected when a component unmounts; let callers recognise and ignore them.
    if (error.name === 'AbortError') throw error
    throw new ApiError(`API is unreachable at ${API_BASE_URL}`, { status: 0 })
  }
}

async function parse(response) {
  if (!response.ok) {
    const problem = await readProblem(response)
    throw new ApiError(problem?.detail ?? problem?.title ?? `API request failed: ${response.status}`, {
      status: response.status,
      problem,
    })
  }
  // Some successes have no body: 202 (resend-verification), 204 (logout), 201 (contact message).
  const text = await response.text()
  return text ? JSON.parse(text) : null
}

// One refresh at a time: parallel requests with an expired token share the same refresh call,
// because each refresh token can be used only once.
let refreshInFlight = null

/** Exchanges the stored refresh token for a new session; returns the new access token, or null when signed out. */
export function refreshSession() {
  refreshInFlight ??= (async () => {
    const session = getSession()
    if (!session) return null
    try {
      const response = await send('/auth/refresh-token', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: session.refreshToken }),
      })
      return setSession(await parse(response)).accessToken
    } catch (error) {
      // Another tab may have rotated the shared refresh token first; use its session instead of signing out.
      const current = getSession()
      if (current && current.refreshToken !== session.refreshToken) return current.accessToken
      if (error instanceof ApiError && error.status === 401) clearSession()
      return null
    } finally {
      refreshInFlight = null
    }
  })()
  return refreshInFlight
}

async function currentAccessToken() {
  const session = getSession()
  if (!session) return null
  const expiresAt = Date.parse(session.accessTokenExpiresAt)
  if (Number.isFinite(expiresAt) && expiresAt - Date.now() > REFRESH_MARGIN_MS) return session.accessToken
  return refreshSession()
}

/**
 * Calls the API. A signed-in user's access token is attached automatically ("Authorization: Bearer"),
 * refreshed shortly before it expires, and refreshed once more if the API still answers 401.
 * Pass `auth: false` for the auth endpoints themselves.
 */
export async function apiClient(path, { auth = true, ...init } = {}) {
  const token = auth ? await currentAccessToken() : null
  let response = await send(path, init, token)

  if (response.status === 401 && token) {
    const renewed = await refreshSession()
    if (renewed) response = await send(path, init, renewed)
  }

  return parse(response)
}
