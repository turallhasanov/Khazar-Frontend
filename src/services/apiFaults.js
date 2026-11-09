/**
 * Central reporting of unexpected API failures: the API is unreachable, or it answered with a server fault that no
 * page handles specifically. `api.js` reports them; whichever notifier is mounted shows them. The admin panel's toasts
 * take precedence over the storefront notice while they are mounted, so a fault is shown once, in the right place.
 *
 * Callers still receive the ApiError as before: this only adds a notification, it never changes what a page does.
 */

export const API_FAULT_MESSAGES = {
  network: 'Serverə qoşulmaq mümkün olmadı.',
  server: 'Sistemdə xəta baş verdi. Bir az sonra yenidən cəhd edin.',
}

/**
 * 5xx codes a page handles itself (502 from a NexusERP sync, for example, carries its own errorCode and message).
 * Only the generic ones, or a 5xx without a ProblemDetails body (a proxy, a crashed process), are reported here.
 */
const GENERIC_SERVER_ERROR_CODES = new Set([null, undefined, 'internal_error', 'service_unavailable'])

export function isUnexpectedServerFault(status, problem) {
  return status >= 500 && GENERIC_SERVER_ERROR_CODES.has(problem?.errorCode)
}

const sinks = new Set()

/** Registers a notifier; the one with the highest priority receives faults. Returns the unregister function. */
export function registerApiFaultSink(sink, priority = 0) {
  const entry = { sink, priority }
  sinks.add(entry)
  return () => sinks.delete(entry)
}

/** @param {'network' | 'server'} kind */
export function reportApiFault(kind) {
  let target = null
  for (const entry of sinks) {
    if (!target || entry.priority >= target.priority) target = entry
  }
  target?.sink(API_FAULT_MESSAGES[kind], kind)
}
