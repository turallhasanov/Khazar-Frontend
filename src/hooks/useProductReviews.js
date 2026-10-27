import { useCallback, useEffect, useState } from 'react'
import { getProductReviews } from '../services/reviewService.js'

/**
 * Loads the approved reviews and rating statistics of a product.
 * Returns { data, status: 'loading' | 'ready' | 'error', reload }.
 */
export function useProductReviews(productId) {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState({ key: null, data: null, status: 'loading' })
  const requestKey = `${productId}#${attempt}`

  useEffect(() => {
    const controller = new AbortController()
    getProductReviews(productId, { signal: controller.signal })
      .then((data) => setResult({ key: requestKey, data, status: 'ready' }))
      .catch((error) => {
        if (error.name === 'AbortError') return
        setResult({ key: requestKey, data: null, status: 'error' })
      })
    return () => controller.abort()
  }, [productId, requestKey])

  const reload = useCallback(() => setAttempt((current) => current + 1), [])

  // Keep showing the previous data while a reload is in flight.
  const status = result.key === requestKey ? result.status : result.data ? 'ready' : 'loading'
  return { data: result.data, status, reload }
}
