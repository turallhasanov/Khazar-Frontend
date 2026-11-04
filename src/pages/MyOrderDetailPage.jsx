import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { OrderLine, OrderStatusBadge } from '../components/orders/OrderParts.jsx'
import { PageHeader } from '../components/layout/PageHeader'
import { useAuth } from '../context/AuthContext.jsx'
import { ApiError } from '../services/api.js'
import { formatPrice } from '../services/formatPrice'
import { formatOrderDate } from '../services/orderStatus.js'
import { getMyOrder } from '../services/orderService.js'

/** /sifarislerim/:orderNumber — one order: status, date, purchased lines, shipping address and total. */
export function MyOrderDetailPage() {
  const { orderNumber } = useParams()
  const { isAuthenticated } = useAuth()
  const [state, setState] = useState({ status: 'loading', order: null })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!isAuthenticated) return undefined
    const controller = new AbortController()
    getMyOrder(orderNumber, { signal: controller.signal })
      .then((order) => setState({ status: 'ready', order }))
      .catch((error) => {
        if (controller.signal.aborted || error?.name === 'AbortError') return
        setState({ status: error instanceof ApiError && error.status === 404 ? 'missing' : 'error', order: null })
      })
    return () => controller.abort()
  }, [isAuthenticated, orderNumber, attempt])

  if (!isAuthenticated) return <Navigate to="/giris" replace />

  const { order } = state

  return (
    <main className="flex-1">
      <PageHeader eyebrow="Sifariş" title={`#${orderNumber}`} />

      <section className="mx-auto max-w-3xl px-6 py-12 md:py-16">
        <Link to="/sifarislerim" className="text-xs uppercase tracking-[0.14em] text-ink-700 hover:text-clay-600">
          ← Sifarişlərim
        </Link>

        {state.status === 'loading' && (
          <p role="status" className="mt-10 text-center text-sm text-ink-500">
            Sifariş yüklənir…
          </p>
        )}

        {state.status === 'missing' && (
          <p role="alert" className="mt-10 text-center text-[15px] text-ink-700">
            Bu nömrəli sifariş tapılmadı.
          </p>
        )}

        {state.status === 'error' && (
          <div role="alert" className="mt-10 text-center">
            <p className="text-[15px] text-ink-700">Sifariş yüklənmədi. Bir az sonra yenidən cəhd edin.</p>
            <button
              type="button"
              onClick={() => {
                setState({ status: 'loading', order: null })
                setAttempt((n) => n + 1)
              }}
              className="mt-6 text-xs uppercase tracking-[0.14em] text-ink-900 underline"
            >
              Yenidən cəhd et
            </button>
          </div>
        )}

        {state.status === 'ready' && order && (
          <div className="mt-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-ink-500">{formatOrderDate(order.createdAt)}</p>
              <OrderStatusBadge status={order.status} />
            </div>

            <ul className="mt-6 divide-y divide-linen-200 border-y border-linen-200">
              {order.items.map((item, index) => (
                <OrderLine key={`${item.productId}-${item.size}-${item.color}-${index}`} item={item} />
              ))}
            </ul>

            <div className="mt-6 flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.14em] text-ink-500">Cəmi</span>
              <span className="font-display text-2xl text-ink-900">{formatPrice(order.totalAmount)}</span>
            </div>

            <div className="mt-10">
              <h2 className="text-xs uppercase tracking-[0.14em] text-ink-500">Çatdırılma ünvanı</h2>
              <p className="mt-2 text-[15px] text-ink-900">{order.shippingAddress}</p>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
