import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getSiteContent } from '../services/contentService.js'
import { useLiveRefresh } from '../services/liveUpdates.js'

/**
 * Storefront content from GET /api/content — page sections, lookbook, journal and FAQ, all managed in the admin
 * panel (/admin/mezmun …) and stored in the database. Loaded once per visit, refreshed in place when the admin panel
 * announces a change ('content' topic) and when the tab regains focus.
 * status: 'loading' | 'ready' | 'error'. A refresh that fails keeps the content already on screen.
 */
const SiteContentContext = createContext(null)

export function SiteContentProvider({ children }) {
  const [state, setState] = useState({ content: null, status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    getSiteContent({ signal: controller.signal })
      .then((content) => setState({ content, status: 'ready' }))
      .catch((error) => {
        if (error.name === 'AbortError') return
        console.error('[Khazar] Failed to load the site content:', error)
        setState((current) => (current.content ? current : { content: null, status: 'error' }))
      })
    return () => controller.abort()
  }, [attempt])

  // Silent: the current content stays on screen until the new one arrives.
  const refresh = useCallback(() => setAttempt((current) => current + 1), [])

  const reload = useCallback(() => {
    setState((current) => (current.content ? current : { content: null, status: 'loading' }))
    setAttempt((current) => current + 1)
  }, [])

  useLiveRefresh('content', refresh)

  const value = useMemo(() => ({ ...state, reload }), [state, reload])
  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>
}

// oxlint-disable-next-line react/only-export-components -- provider and hooks are kept together
export function useSiteContent() {
  const context = useContext(SiteContentContext)
  if (!context) throw new Error('useSiteContent must be used within a SiteContentProvider')
  return context
}

/** One saved section ("hero", "about", …), or null while loading or when it was never saved. */
// oxlint-disable-next-line react/only-export-components -- provider and hooks are kept together
export function useContentSection(key) {
  return useSiteContent().content?.sections?.[key] ?? null
}
