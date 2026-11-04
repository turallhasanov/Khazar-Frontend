import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const auth = { isAuthenticated: true }
vi.mock('../../context/AuthContext.jsx', () => ({ useAuth: () => auth }))
vi.mock('../../services/orderService.js', () => ({ getMyOrders: vi.fn(), getMyOrder: vi.fn() }))

const { getMyOrders } = await import('../../services/orderService.js')
const { MyOrdersPage } = await import('../MyOrdersPage.jsx')

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/sifarislerim']}>
      <Routes>
        <Route path="/sifarislerim" element={<MyOrdersPage />} />
        <Route path="/giris" element={<h2>Giriş</h2>} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  auth.isAuthenticated = true
  vi.mocked(getMyOrders).mockReset()
})

describe('MyOrdersPage', () => {
  it('lists each order with number, total and a colored status', async () => {
    vi.mocked(getMyOrders).mockResolvedValue([
      { id: '1', orderNumber: 'KHZ-AAAAA', status: 'Completed', createdAt: '2026-11-04T10:00:00', totalAmount: 120 },
      { id: '2', orderNumber: 'KHZ-BBBBB', status: 'Pending', createdAt: '2026-11-04T11:00:00', totalAmount: 50.5 },
      { id: '3', orderNumber: 'KHZ-CCCCC', status: 'Cancelled', createdAt: '2026-11-04T12:00:00', totalAmount: 10 },
    ])

    renderPage()

    expect(await screen.findByText('#KHZ-AAAAA')).toBeInTheDocument()
    expect(screen.getByText('120,00 ₼')).toBeInTheDocument()
    expect(screen.getByText('Tamamlandı')).toHaveAttribute('data-tone', 'green')
    expect(screen.getByText('Gözləmədə')).toHaveAttribute('data-tone', 'yellow')
    expect(screen.getByText('Ləğv edildi')).toHaveAttribute('data-tone', 'red')
  })

  it('shows a retry message instead of crashing when the API fails', async () => {
    vi.mocked(getMyOrders).mockRejectedValue(new Error('network'))

    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent('Sifarişlər yüklənmədi')
    expect(screen.getByRole('button', { name: 'Yenidən cəhd et' })).toBeInTheDocument()
  })

  it('shows the empty state', async () => {
    vi.mocked(getMyOrders).mockResolvedValue([])

    renderPage()

    expect(await screen.findByText('Hələ sifarişiniz yoxdur.')).toBeInTheDocument()
  })

  it('sends a signed-out visitor to the sign-in page without calling the API', async () => {
    auth.isAuthenticated = false

    renderPage()

    expect(await screen.findByRole('heading', { name: 'Giriş' })).toBeInTheDocument()
    expect(getMyOrders).not.toHaveBeenCalled()
  })
})
