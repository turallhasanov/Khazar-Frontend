// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../authSession.js', () => ({
  getSession: vi.fn(() => null),
  setSession: vi.fn(),
  clearSession: vi.fn(),
}))

const { apiClient, ApiError } = await import('../api.js')
const { API_FAULT_MESSAGES, registerApiFaultSink } = await import('../apiFaults.js')
const { getSession } = await import('../authSession.js')

let faults
let unregister
let fetchMock

function problem(status, body) {
  return new Response(body === undefined ? 'Internal Server Error' : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': body === undefined ? 'text/plain' : 'application/problem+json' },
  })
}

beforeEach(() => {
  faults = vi.fn()
  unregister = registerApiFaultSink(faults)
  fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
  vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.mocked(getSession).mockReturnValue(null)
})

afterEach(() => {
  unregister()
  vi.unstubAllGlobals()
})

describe('api.js server faults', () => {
  it('reports an unexpected 500 and still rejects with the ProblemDetails', async () => {
    fetchMock.mockResolvedValue(problem(500, {
      title: 'An unexpected error occurred', status: 500, errorCode: 'internal_error', traceId: '00-1',
      detail: 'An unexpected error occurred. Please try again later and quote the trace id if the problem persists.',
    }))

    const error = await apiClient('/products').catch((e) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 500, code: 'internal_error' })
    expect(error.problem.traceId).toBe('00-1')
    expect(faults).toHaveBeenCalledOnce()
    expect(faults).toHaveBeenCalledWith(API_FAULT_MESSAGES.server, 'server')
  })

  it('reports a 5xx without a JSON body', async () => {
    fetchMock.mockResolvedValue(problem(502))

    await expect(apiClient('/products')).rejects.toMatchObject({ status: 502, problem: null, message: 'API request failed: 502' })
    expect(faults).toHaveBeenCalledWith(API_FAULT_MESSAGES.server, 'server')
  })

  it('leaves a 502 the page handles itself (nexus_sync_failed) to the page', async () => {
    fetchMock.mockResolvedValue(problem(502, { status: 502, errorCode: 'nexus_sync_failed', detail: 'NexusERP sinxronizasiyası alınmadı.' }))

    await expect(apiClient('/admin/products', { method: 'POST', body: '{}' }))
      .rejects.toMatchObject({ code: 'nexus_sync_failed', message: 'NexusERP sinxronizasiyası alınmadı.' })
    expect(faults).not.toHaveBeenCalled()
  })

  it.each([
    [400, 'validation_failed'],
    [404, 'not_found'],
    [409, 'insufficient_stock'],
  ])('does not report a %i (%s): the page shows it', async (status, errorCode) => {
    fetchMock.mockResolvedValue(problem(status, { status, errorCode, detail: 'x' }))

    await expect(apiClient('/orders')).rejects.toMatchObject({ status, code: errorCode })
    expect(faults).not.toHaveBeenCalled()
  })
})

describe('api.js network failures', () => {
  it('reports an unreachable API and rejects with status 0', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))

    const error = await apiClient('/products').catch((e) => e)

    expect(error).toMatchObject({ name: 'ApiError', status: 0 })
    expect(faults).toHaveBeenCalledWith(API_FAULT_MESSAGES.network, 'network')
  })

  it('lets an abort through untouched and reports nothing', async () => {
    const abort = new DOMException('The operation was aborted.', 'AbortError')
    fetchMock.mockRejectedValue(abort)

    await expect(apiClient('/products')).rejects.toBe(abort)
    expect(faults).not.toHaveBeenCalled()
  })
})

describe('api.js success path', () => {
  it('parses JSON, returns null for an empty body and sends the access token', async () => {
    vi.mocked(getSession).mockReturnValue({
      accessToken: 'access-1', refreshToken: 'r', accessTokenExpiresAt: new Date(Date.now() + 600_000).toISOString(),
    })
    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify([{ id: 'p-1' }]), { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))

    await expect(apiClient('/products')).resolves.toEqual([{ id: 'p-1' }])
    await expect(apiClient('/auth/logout', { method: 'POST' })).resolves.toBeNull()

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toMatch(/\/api\/products$/)
    expect(init.headers.Authorization).toBe('Bearer access-1')
    expect(init.headers['Content-Type']).toBeUndefined() // GET stays a CORS "simple" request
    expect(faults).not.toHaveBeenCalled()
  })
})
