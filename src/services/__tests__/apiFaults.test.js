import { afterEach, describe, expect, it, vi } from 'vitest'
import { API_FAULT_MESSAGES, isUnexpectedServerFault, registerApiFaultSink, reportApiFault } from '../apiFaults.js'

const unregister = []

afterEach(() => {
  unregister.splice(0).forEach((off) => off())
})

function sink(priority) {
  const fn = vi.fn()
  unregister.push(registerApiFaultSink(fn, priority))
  return fn
}

describe('isUnexpectedServerFault', () => {
  it.each([
    [500, { errorCode: 'internal_error' }, true],
    [503, { errorCode: 'service_unavailable' }, true],
    [500, null, true], // no ProblemDetails body: a proxy or a crashed process
    [502, {}, true],
    [502, { errorCode: 'nexus_sync_failed' }, false], // the page explains this one itself
    [404, { errorCode: 'not_found' }, false],
    [409, { errorCode: 'insufficient_stock' }, false],
    [400, null, false],
  ])('status %i with %j → %s', (status, problem, expected) => {
    expect(isUnexpectedServerFault(status, problem)).toBe(expected)
  })
})

describe('reportApiFault', () => {
  it('sends the message for the kind to the registered sink', () => {
    const notice = sink(0)

    reportApiFault('network')
    reportApiFault('server')

    expect(notice).toHaveBeenNthCalledWith(1, API_FAULT_MESSAGES.network, 'network')
    expect(notice).toHaveBeenNthCalledWith(2, API_FAULT_MESSAGES.server, 'server')
  })

  it('delivers to the highest-priority sink only (admin toasts over the storefront notice)', () => {
    const storefront = sink(0)
    const admin = sink(1)

    reportApiFault('server')

    expect(admin).toHaveBeenCalledOnce()
    expect(storefront).not.toHaveBeenCalled()
  })

  it('falls back to the next sink once the preferred one unregisters', () => {
    const storefront = sink(0)
    const admin = vi.fn()
    const offAdmin = registerApiFaultSink(admin, 1)

    offAdmin()
    reportApiFault('network')

    expect(admin).not.toHaveBeenCalled()
    expect(storefront).toHaveBeenCalledOnce()
  })

  it('does nothing when no notifier is mounted', () => {
    expect(() => reportApiFault('server')).not.toThrow()
  })
})
