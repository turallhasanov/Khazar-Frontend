import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getProducts } from '../services/productService.js'

/**
 * Catalog loaded once from GET /api/v1/products and shared by the catalog, search,
 * wishlist, lookbook and "complete the look" components.
 * status: 'loading' | 'ready' | 'error'
 */
const ProductsContext = createContext(null)

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    getProducts({ signal: controller.signal })
      .then((data) => {
        setProducts(data)
        setStatus('ready')
      })
      .catch((reason) => {
        if (reason.name === 'AbortError') return
        console.error('[Khazar] Failed to load the catalog:', reason)
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

  const value = useMemo(
    () => ({ products, status, error, reload }),
    [products, status, error, reload],
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
