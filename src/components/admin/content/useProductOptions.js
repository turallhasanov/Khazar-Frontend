import { useEffect, useState } from 'react'
import { getAdminProducts } from '../../../services/adminService.js'

/**
 * Products for the hero and lookbook hotspot selects ({ id, name, slug, isActive, ... } from GET /admin/products),
 * active ones first. Empty until loaded; a failed load leaves it empty, and the select still shows the saved slug.
 */
export function useProductOptions() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    const controller = new AbortController()
    getAdminProducts({ signal: controller.signal })
      .then((items) =>
        setProducts(
          [...items].sort((a, b) => Number(b.isActive) - Number(a.isActive) || a.name.localeCompare(b.name, 'az')),
        ),
      )
      .catch((error) => {
        if (error.name !== 'AbortError') console.error('[Khazar admin] Products for the selects did not load:', error)
      })
    return () => controller.abort()
  }, [])

  return products
}
