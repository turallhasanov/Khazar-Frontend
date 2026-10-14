import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { Product } from '../types/product'

/**
 * Mikro-Aşama 2 (minimal): Sepet rozeti (badge) için dinamik ürün sayısı.
 * Tam sepet mantığı (adet artır/azalt, varyant bazlı satırlar) Mikro-Aşama 9'da genişletilecek.
 */

export interface CartLine {
  id: string
  slug: string
  name: string
  basePrice: number
  currency: 'AZN'
  image: string
  variantKey: string
  quantity: number
}

interface AddItemOptions {
  quantity?: number
  variantKey?: string
}

interface CartContextValue {
  items: CartLine[]
  count: number
  addItem: (product: Product, options?: AddItemOptions) => void
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = 'khazar-cart'

function readStoredItems(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLine[]>(readStoredItems)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const count = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items],
  )

  /** Aynı ürün+varyant varsa adedini artırır, yoksa yeni satır ekler. */
  const addItem = (product: Product, options: AddItemOptions = {}) => {
    const { quantity = 1, variantKey = 'default' } = options
    setItems((current) => {
      const index = current.findIndex(
        (item) => item.id === product.id && item.variantKey === variantKey,
      )
      if (index === -1) {
        return [
          ...current,
          {
            id: product.id,
            slug: product.slug,
            name: product.name,
            basePrice: product.basePrice,
            currency: product.currency,
            image: product.images[0] ?? '',
            variantKey,
            quantity,
          },
        ]
      }
      const next = [...current]
      next[index] = { ...next[index], quantity: next[index].quantity + quantity }
      return next
    })
  }

  const value = useMemo(() => ({ items, count, addItem }), [items, count])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// oxlint-disable-next-line react/only-export-components -- provider + hook birlikte tutulur (fast-refresh uyarısı bilinçli bastırıldı)
export function useCart(): CartContextValue {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
