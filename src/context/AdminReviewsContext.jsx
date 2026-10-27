import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getReviewsForModeration, updateReviewStatus } from '../services/adminService.js'

/**
 * The moderation list for the admin panel, loaded once from GET /api/admin/reviews (every status) and shared by
 * the sidebar badge and the reviews page. The API has no paging or search, so filtering happens on the client.
 *
 * `saveStatus` only calls the API; `applyReview` puts the returned review into the list. They are separate so the
 * page can let a row animate out before it leaves the current filter.
 */
const AdminReviewsContext = createContext(null)

export function AdminReviewsProvider({ children }) {
  // status: loading | ready | error. `refreshing` is a reload while data is already shown.
  const [state, setState] = useState({ status: 'loading', reviews: [], error: null, loadedAt: null, refreshing: false })
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    getReviewsForModeration({ signal: controller.signal })
      .then((reviews) =>
        setState({ status: 'ready', reviews, error: null, loadedAt: new Date(), refreshing: false }),
      )
      .catch((error) => {
        if (error.name === 'AbortError') return
        // A failed refresh keeps the list that is already on screen.
        setState((current) => ({
          ...current,
          status: current.loadedAt ? 'ready' : 'error',
          error,
          refreshing: false,
        }))
      })
    return () => controller.abort()
  }, [reloadKey])

  const reload = useCallback(() => {
    setState((current) => ({ ...current, refreshing: true, error: null }))
    setReloadKey((current) => current + 1)
  }, [])

  const applyReview = useCallback((updated) => {
    setState((current) => ({
      ...current,
      reviews: current.reviews.map((review) => (review.id === updated.id ? updated : review)),
    }))
  }, [])

  const removeReview = useCallback((id) => {
    setState((current) => ({ ...current, reviews: current.reviews.filter((review) => review.id !== id) }))
  }, [])

  const value = useMemo(
    () => ({ ...state, reload, saveStatus: updateReviewStatus, applyReview, removeReview }),
    [state, reload, applyReview, removeReview],
  )

  return <AdminReviewsContext.Provider value={value}>{children}</AdminReviewsContext.Provider>
}

// oxlint-disable-next-line react/only-export-components -- provider + hook birlikte tutulur
export function useAdminReviews() {
  const context = useContext(AdminReviewsContext)
  if (!context) throw new Error('useAdminReviews must be used within an AdminReviewsProvider')
  return context
}
