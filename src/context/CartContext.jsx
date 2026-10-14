import { createContext, useContext, useEffect, useMemo, useState } from 'react'

/**
 * Mikro-Aşama 9: Kapsamlı sepet state yönetimi.
 * - Varyant bazlı satırlar (productId + rəng + ölçü)
 * - addToCart / removeFromCart / updateQuantity / clearCart
 * - Dinamik hesaplamalar (subtotal, endirim, total)
 * - localStorage kalıcılığı
 */

/**
 * Sepet satırı (JSDoc).
 * @typedef {Object} CartLine
 * @property {string} cartItemId Benzersiz satır kimliyi: productId + renk + beden
 * @property {string} productId
 * @property {string} slug
 * @property {string} name
 * @property {{name: string, hex: string}} color
 * @property {string} size
 * @property {string} image
 * @property {number} unitPrice Birim satış fiyatı (indirimli)
 * @property {number} [compareAtPrice] Varsa birim indirim öncesi fiyat
 * @property {'AZN'} currency
 * @property {number} quantity
 */

const CartContext = createContext(null)

const STORAGE_KEY = 'khazar-cart-v2'

/** Varyant kombinasyonundan benzersiz satır kimliyi üretir. */
function buildCartItemId(productId, colorName, size) {
  return `${productId}::${colorName}::${size}`
}

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
  const [isCartOpen, setIsCartOpen] = useState(false)

  // Kalıcılık: her değişiklikte localStorage'a yaz
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addToCart = (product, color, size, quantity = 1) => {
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

  const removeFromCart = (cartItemId) => {
    setItems((current) => current.filter((item) => item.cartItemId !== cartItemId))
  }

  const updateQuantity = (cartItemId, newQuantity) => {
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

  const value = useMemo(
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
export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
