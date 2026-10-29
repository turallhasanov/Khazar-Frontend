import { useEffect, useRef } from 'react'

/**
 * Admin panel → storefront live updates. After a successful save the admin panel announces the changed topic on a
 * BroadcastChannel; storefront tabs of the same browser that listen to it reload that data at once. Every other
 * visitor gets the change on their next load, or when they come back to the tab (focus refresh below).
 * Topics: 'content' (pages, lookbook, journal, FAQ), 'catalog' (products, categories), 'reviews'.
 */
const CHANNEL_NAME = 'khazar-live-updates'

/** A tab that regains focus refetches at most this often, so switching tabs back and forth stays cheap. */
const FOCUS_REFRESH_MS = 30_000

const openChannel = () => (typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(CHANNEL_NAME))

/** Tells the other open tabs that `topic` changed on the server. */
export function announceChange(topic) {
  const channel = openChannel()
  if (!channel) return
  channel.postMessage({ topic })
  channel.close()
}

/**
 * Calls `refresh` when another tab announces `topic`, and when this tab becomes visible again after
 * FOCUS_REFRESH_MS. `refresh` should keep the current data on screen while it reloads.
 */
export function useLiveRefresh(topic, refresh) {
  const latest = useRef(refresh)
  useEffect(() => {
    latest.current = refresh
  })

  useEffect(() => {
    let lastRun = Date.now()
    const run = () => {
      lastRun = Date.now()
      latest.current()
    }

    const channel = openChannel()
    const onMessage = (event) => {
      if (event.data?.topic === topic) run()
    }
    const onVisible = () => {
      if (document.visibilityState === 'visible' && Date.now() - lastRun > FOCUS_REFRESH_MS) run()
    }

    channel?.addEventListener('message', onMessage)
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)
    return () => {
      channel?.close()
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
    }
  }, [topic])
}
