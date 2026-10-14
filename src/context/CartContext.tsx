import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ColorOption, Product, Size } from '../types/product'

/**
 * Mikro-Aşama 9: Kapsamlı sepet state yönetimi.
 * - Varyant bazlı satırlar (productId + rəng + ölçü)
 * - addToCart / removeFromCart / updateQuantity / clearCart
 * - Dinamik hesaplamalar (subtotal, endirim, total)
 * - localStorage kalıcılığı
 */

export interface CartLine {
  /** Benzersiz satır kimliyi: productId + renk + beden. */
  cartItemId: string
  productId: string
  slug: string
  name: string
  color: ColorOption
  size: Size
  image: string
  /** Birim satış fiyatı (indirimli). */
  unitPrice: number
  /** Varsa birim indirim öncesi fiyat. */
  compareAtPrice?: number
  currency: 'AZN'
  quantity: number
}

interface CartContextValue {
  items: CartLine[]
  totalItemsCount: number
  subtotalPrice: number
  discountAmount: number
  totalPrice: number
  addToCart: (product: Product, color: ColorOption, size: Size, quantity?: number) => void
  removeFromCart: (cartItemId: string) => void
  updateQuantity: (cartItemId: string, newQuantity: number) => void
  clearCart: () => void
  /** Slide-over sepet paneli (Mikro-Aşama 10) */
  isCartOpen: boolean
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = 'khazar-cart-v2'

/** Varyant kombinasyonundan benzersiz satır kimliyi üretir. */
function buildCartItemId(productId: string, colorName: string, size: Size): string {
  return `${productId}::${colorName}::${size}`
}

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
  const [isCartOpen, setIsCartOpen] = useState(false)

  // Kalıcılık: her değişiklikte localStorage'a yaz
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addToCart = (
    product: Product,
    color: ColorOption,
    size: Size,
    quantity = 1,
  ) => {
    const cartItemId = buildCartItemId(product.id, color.name, size)
    setItems((current) => {
      const index = current.findIndex((item) => item.cartItemId === cartItemId)
      if (index === -1) {
        return [
          ...current,
          {
            cartItemId,
            productId: product.id,
            slug: product.slug,
            name: product.name,
            color,
            size,
            image: product.images[0] ?? '',
            unitPrice: product.basePrice,
            compareAtPrice: product.compareAtPrice,
            currency: product.currency,
            quantity,
          },
        ]
      }
      const next = [...current]
      next[index] = {
        ...next[index],
        quantity: next[index].quantity + quantity,
      }
      return next
    })
  }

  const removeFromCart = (cartItemId: string) => {
    setItems((current) => current.filter((item) => item.cartItemId !== cartItemId))
  }

  const updateQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId)
      return
    }
    setItems((current) =>
      current.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity: newQuantity } : item,
      ),
    )
  }

  const clearCart = () => setItems([])

  const totals = useMemo(() => {
    const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0)
    const subtotalPrice = items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    )
    const discountAmount = items.reduce(
      (sum, item) =>
        sum +
        (item.compareAtPrice ? (item.compareAtPrice - item.unitPrice) * item.quantity : 0),
      0,
    )
    return { totalItemsCount, subtotalPrice, discountAmount, totalPrice: subtotalPrice }
  }, [items])

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      ...totals,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      isCartOpen,
      openCart: () => setIsCartOpen(true),
      closeCart: () => setIsCartOpen(false),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- metodlar setItems/setState üzerinden stabil
    [items, totals, isCartOpen],
  )

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
