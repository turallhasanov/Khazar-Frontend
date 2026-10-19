import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useProducts } from './ProductsContext'

/**
 * Wishlist / İstək Siyahısı sistemi.
 * - Ürün ID'leri localStorage'da saklanır (`khazar-wishlist-v1`)
 * - toggleWishlist / isInWishlist / count metodları
 * - Sağdan açılır panel için isOpen / openWishlist / closeWishlist
 */

// v2: product ids are API GUIDs; v1 held mock ids ('p-001') that no longer resolve.
const STORAGE_KEY = 'khazar-wishlist-v2'

function readStoredIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : []
  } catch {
    return []
  }
}

const WishlistContext = createContext(null)

export function WishlistProvider({ children }) {
  const [ids, setIds] = useState(readStoredIds)
  const [isOpen, setIsOpen] = useState(false)
  const { products } = useProducts()

  // Kalıcılık: her değişiklikte localStorage'a yaz
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  }, [ids])

  const toggleWishlist = (productId) => {
    setIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    )
  }

  const isInWishlist = (productId) => ids.includes(productId)

  const items = useMemo(
    () => products.filter((product) => ids.includes(product.id)),
    [products, ids],
  )
  const count = ids.length

  const value = useMemo(
    () => ({
      ids,
      items,
      count,
      toggleWishlist,
      isInWishlist,
      isOpen,
      openWishlist: () => setIsOpen(true),
      closeWishlist: () => setIsOpen(false),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- metodlar setIds/setState üzerinden stabil
    [ids, items, count, isOpen],
  )

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

// oxlint-disable-next-line react/only-export-components -- provider + hook birlikte tutulur (fast-refresh uyarısı bilinçli bastırıldı)
export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}
