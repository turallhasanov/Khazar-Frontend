import { apiClient } from './api.js'

/**
 * POST /orders — places an order and returns the server's OrderResponseDto.
 * The server generates the order number and recalculates every price from the catalog,
 * so only customer, shipping, payment and item references are sent.
 * Errors: 400 validation, 404 unknown product/variant, 409 insufficient stock (ApiError.status).
 */
export function createOrder({ customer, shipping, payment, items }) {
  return apiClient('/orders', {
    method: 'POST',
    body: JSON.stringify({
      source: 'khazar-web',
      customer,
      shipping,
      payment,
      items: items.map((item) => ({
        productId: item.productId,
        stockRef: { color: item.color.name, size: item.size },
        quantity: item.quantity,
      })),
    }),
  })
}
