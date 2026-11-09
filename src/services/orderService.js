import { apiClient } from './api.js'

/**
 * POST /orders — places an order and returns the server's OrderResponseDto.
 * The server generates the order number and recalculates every price from the catalog,
 * so only customer, shipping, payment and item references are sent.
 * Errors: 400 validation, 404 unknown product/variant, 409 insufficient stock (ApiError.status).
 * When the customer is signed in, apiClient sends the access token and the API links the order to the account.
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

/** GET /orders/my-orders — the signed-in customer's own orders, newest first (401 when the session is gone). */
export function getMyOrders({ signal } = {}) {
  return apiClient('/orders/my-orders', { signal })
}

/** GET /orders/my-orders/{orderNumber} — one of the customer's own orders (404 also for someone else's). */
export function getMyOrder(orderNumber, { signal } = {}) {
  return apiClient(`/orders/my-orders/${encodeURIComponent(orderNumber)}`, { signal })
}
