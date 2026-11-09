import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { OrderConfirmation } from '../OrderConfirmation.jsx'

const order = {
  number: '#KHZ-AB234',
  total: 128,
  itemCount: 2,
  name: 'Ali Aliyev',
  city: 'Bakı',
  payment: 'Qapıda nağd',
  response: { orderNumber: 'KHZ-AB234', status: 'Pending' },
}

function renderConfirmation(props) {
  return render(
    <MemoryRouter>
      <OrderConfirmation order={order} {...props} />
    </MemoryRouter>,
  )
}

afterEach(() => vi.unstubAllEnvs())

describe('OrderConfirmation', () => {
  it('shows the clean confirmation, the order number and the totals', () => {
    vi.stubEnv('DEV', false)
    renderConfirmation({ signedIn: true })

    expect(screen.getByRole('heading', { name: 'Sifarişiniz qəbul edildi' })).toBeInTheDocument()
    expect(screen.getByText('#KHZ-AB234')).toBeInTheDocument()
    expect(screen.getByText('128,00 ₼')).toBeInTheDocument()
  })

  it.each([false, true])('never renders the API debug block (DEV=%s)', (dev) => {
    vi.stubEnv('DEV', dev)
    const { container } = renderConfirmation({ signedIn: true })

    expect(screen.queryByText(/API cavabı/i)).not.toBeInTheDocument()
    expect(container.querySelector('details, pre')).toBeNull()
    expect(container).not.toHaveTextContent('"status"')
  })

  it('offers "Sifarişlərim" to signed-in customers only', () => {
    vi.stubEnv('DEV', false)
    const { unmount } = renderConfirmation({ signedIn: true })
    expect(screen.getByRole('link', { name: 'Sifarişlərim' })).toHaveAttribute('href', '/sifarislerim')
    expect(screen.getByRole('link', { name: 'Kataloqa qayıt' })).toHaveAttribute('href', '/katalog')
    unmount()

    renderConfirmation({ signedIn: false })
    expect(screen.queryByRole('link', { name: 'Sifarişlərim' })).not.toBeInTheDocument()
  })
})
