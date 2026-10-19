/**
 * Base URL of the Khazar WebAPI endpoints. Override with VITE_API_BASE_URL in .env;
 * the default matches the "http" profile in Khazar.WebAPI/Properties/launchSettings.json.
 */
export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5293/api'
).replace(/\/+$/, '')

/**
 * Error thrown for non-2xx responses and network failures.
 * The API returns RFC 7807 ProblemDetails; `problem` holds that body when present.
 */
export class ApiError extends Error {
  constructor(message, { status = 0, problem = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.problem = problem
  }
}

async function readProblem(response) {
  try {
    return await response.json()
  } catch {
    return null
  }
}

export async function apiClient(path, init) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        // Only requests with a body declare a content type, so GETs stay CORS "simple" requests.
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers,
      },
    })
  } catch (error) {
    // Aborts are expected when a component unmounts; let callers recognise and ignore them.
    if (error.name === 'AbortError') throw error
    throw new ApiError(`API is unreachable at ${API_BASE_URL}`, { status: 0 })
  }

  if (!response.ok) {
    const problem = await readProblem(response)
    throw new ApiError(problem?.detail ?? problem?.title ?? `API request failed: ${response.status}`, {
      status: response.status,
      problem,
    })
  }

  return response.status === 204 ? null : response.json()
}
