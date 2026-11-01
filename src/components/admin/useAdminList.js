import { useCallback, useEffect, useState } from 'react'

export const formatTime = (date) =>
  `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`

/** "29.10.2026, 14:05" in the admin's local time. */
export const formatDateTime = (value) => {
  const date = new Date(value)
  return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}, ${formatTime(date)}`
}

/**
 * Loads an admin list with `load({ signal })` (a module-level function, so it stays the same between renders).
 * status: 'loading' | 'ready' | 'error'; a failed refresh keeps the list on screen with `error` set.
 * `setItems(updater)` applies a saved change locally without reloading.
 */
export function useAdminList(load) {
  const [state, setState] = useState({ status: 'loading', items: [], error: null, loadedAt: null, refreshing: false })
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    load({ signal: controller.signal })
      .then((items) => setState({ status: 'ready', items, error: null, loadedAt: new Date(), refreshing: false }))
      .catch((error) => {
        if (error.name === 'AbortError') return
        setState((current) => ({ ...current, status: current.loadedAt ? 'ready' : 'error', error, refreshing: false }))
      })
    return () => controller.abort()
  }, [load, reloadKey])

  const reload = useCallback(() => {
    setState((current) => ({ ...current, refreshing: true, error: null }))
    setReloadKey((current) => current + 1)
  }, [])

  const setItems = useCallback((updater) => setState((current) => ({ ...current, items: updater(current.items) })), [])

  return { ...state, reload, setItems }
}
