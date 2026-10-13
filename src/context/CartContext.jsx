import { createContext, useContext, useEffect, useMemo, useState } from 'react'

/**
 * Mikro-Aşama 2 (minimal): Sepet rozeti (badge) için dinamik ürün sayısı.
 * Tam sepet mantığı (adet artır/azalt, varyant bazlı satırlar) Mikro-Aşama 9'da genişletilecek.
 */

const CartContext = createContext(null)

const STORAGE_KEY = 'khazar-cart'

function readStoredItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readStoredItems)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const count = useMemo(
    () => items.reduce((total, item) => total + (item.quantity ?? 1), 0),
    [items],
  )

  /** Aynı ürün+varyant varsa adedini artırır, yoksa yeni satır ekler. */
  const addItem = (product, { quantity = 1, variantKey = 'default' } = {}) => {
    setItems((current) => {
      const index = current.findIndex(
        (item) => item.id === product.id && item.variantKey === variantKey,
      )
      if (index === -1) {
        return [...current, { ...product, variantKey, quantity }]
      }
      const next = [...current]
      next[index] = {
        ...next[index],
        quantity: (next[index].quantity ?? 1) + quantity,
      }
      return next
    })
  }

  const value = useMemo(() => ({ items, count, addItem }), [items, count])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// oxlint-disable-next-line react/only-export-components -- provider + hook birlikte tutulur (fast-refresh uyarısı bilinçli bastırıldı)
export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
