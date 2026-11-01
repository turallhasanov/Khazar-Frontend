import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useLiveRefresh } from '../services/liveUpdates.js'
import { getCategories, getProducts } from '../services/productService.js'

/**
 * Catalog loaded once from GET /api/products and shared by the catalog, search,
 * wishlist, lookbook and "complete the look" components. Categories (GET /api/categories) load alongside; if they
 * fail, `categories` stays empty and the catalog falls back to the category names on the products.
 * Refetched in place when the admin panel announces a catalog change and when the tab regains focus.
 * status: 'loading' | 'ready' | 'error'
 */
const ProductsContext = createContext(null)

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)
  const [attempt, setAttempt] = useState(0)
  const loadedRef = useRef(false)

  useEffect(() => {
    const controller = new AbortController()

    Promise.all([
      getProducts({ signal: controller.signal }),
      getCategories({ signal: controller.signal }).catch((reason) => {
        if (reason.name === 'AbortError') throw reason
        console.error('[Khazar] Failed to load the categories:', reason)
        return null
      }),
    ])
      .then(([productData, categoryData]) => {
        loadedRef.current = true
        setProducts(productData)
        // Categories that failed to load keep their previous value (empty on the first load).
        if (categoryData) setCategories(categoryData)
        setStatus('ready')
      })
      .catch((reason) => {
        if (reason.name === 'AbortError') return
        console.error('[Khazar] Failed to load the catalog:', reason)
        // A failed background refresh keeps the catalog already on screen.
        if (loadedRef.current) return
        setError(reason)
        setStatus('error')
      })

    return () => controller.abort()
  }, [attempt])

  // Loading state is set here rather than in the effect, so a retry renders only once before fetching.
  const reload = useCallback(() => {
    setStatus('loading')
    setError(null)
    setAttempt((current) => current + 1)
  }, [])

  // Products or categories changed in the admin panel: refetch while the current catalog stays on screen.
  const refresh = useCallback(() => setAttempt((current) => current + 1), [])
  useLiveRefresh('catalog', refresh)

  const value = useMemo(
    () => ({ products, categories, status, error, reload }),
    [products, categories, status, error, reload],
  )

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}

// oxlint-disable-next-line react/only-export-components -- provider and hook are kept together
export function useProducts() {
  const context = useContext(ProductsContext)
  if (!context) {
    throw new Error('useProducts must be used within a ProductsProvider')
  }
  return context
}
