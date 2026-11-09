import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { OrderStatusBadge } from '../components/orders/OrderParts.jsx'
import { PageHeader } from '../components/layout/PageHeader'
import { useAuth } from '../context/AuthContext.jsx'
import { formatPrice } from '../services/formatPrice'
import { formatOrderDate } from '../services/orderStatus.js'
import { getMyOrders } from '../services/orderService.js'

/**
 * /sifarislerim — the signed-in customer's orders. Network and server faults are also announced by the global
 * ApiFaultNotice; the page shows its own retry state so it never renders blank or throws.
 */
export function MyOrdersPage() {
  const { isAuthenticated } = useAuth()
  const [state, setState] = useState({ status: 'loading', orders: [] })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!isAuthenticated) return undefined
    const controller = new AbortController()
    getMyOrders({ signal: controller.signal })
      .then((orders) => setState({ status: 'ready', orders: Array.isArray(orders) ? orders : [] }))
      .catch((error) => {
        if (controller.signal.aborted || error?.name === 'AbortError') return
        setState({ status: 'error', orders: [] })
      })
    return () => controller.abort()
  }, [isAuthenticated, attempt])

  if (!isAuthenticated) return <Navigate to="/giris" replace />

  const retry = () => {
    setState({ status: 'loading', orders: [] })
    setAttempt((n) => n + 1)
  }

  return (
    <main className="flex-1">
      <PageHeader eyebrow="Hesabım" title="Sifarişlərim" description="Verdiyiniz sifarişlər və onların cari vəziyyəti." />

      <section className="mx-auto max-w-3xl px-6 py-12 md:py-16">
        {state.status === 'loading' && (
          <p role="status" className="text-center text-sm text-ink-500">
            Sifarişlər yüklənir…
          </p>
        )}

        {state.status === 'error' && (
          <div role="alert" className="text-center">
            <p className="text-[15px] text-ink-700">Sifarişlər yüklənmədi. Bir az sonra yenidən cəhd edin.</p>
            <button type="button" onClick={retry} className="mt-6 text-xs uppercase tracking-[0.14em] text-ink-900 underline">
              Yenidən cəhd et
            </button>
          </div>
        )}

        {state.status === 'ready' && state.orders.length === 0 && (
          <div className="text-center">
            <p className="text-[15px] text-ink-700">Hələ sifarişiniz yoxdur.</p>
            <Link to="/katalog" className="mt-6 inline-block text-xs uppercase tracking-[0.14em] text-ink-900 underline">
              Kataloqa keç
            </Link>
          </div>
        )}

        {state.status === 'ready' && state.orders.length > 0 && (
          <ul className="divide-y divide-linen-200 border-y border-linen-200">
            {state.orders.map((order) => (
              <li key={order.id}>
                <Link
                  to={`/sifarislerim/${encodeURIComponent(order.orderNumber)}`}
                  className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-5 transition-colors hover:bg-linen-100"
                >
                  <div>
                    <p className="font-display text-xl text-ink-900">#{order.orderNumber}</p>
                    <p className="mt-1 text-sm text-ink-500">{formatOrderDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-5">
                    <span className="text-[15px] text-ink-900">{formatPrice(order.totalAmount)}</span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
