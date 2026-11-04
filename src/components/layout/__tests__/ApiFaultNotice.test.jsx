import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AdminToastProvider } from '../../admin/AdminToasts.jsx'
import { API_FAULT_MESSAGES, reportApiFault } from '../../../services/apiFaults.js'
import { ApiFaultNotice } from '../ApiFaultNotice.jsx'

afterEach(() => {
  vi.useRealTimers()
})

describe('ApiFaultNotice (storefront)', () => {
  it('shows a reported network fault as an alert', () => {
    render(<ApiFaultNotice />)

    act(() => reportApiFault('network'))

    expect(screen.getByRole('alert')).toHaveTextContent(API_FAULT_MESSAGES.network)
  })

  it('shows one notice per kind however many requests fail', () => {
    render(<ApiFaultNotice />)

    act(() => {
      reportApiFault('server')
      reportApiFault('server')
      reportApiFault('network')
    })

    expect(screen.getAllByRole('alert').map((alert) => alert.textContent))
      .toEqual([API_FAULT_MESSAGES.server, API_FAULT_MESSAGES.network])
  })

  it('closes on its button and by itself after 5 seconds', async () => {
    render(<ApiFaultNotice />)
    act(() => reportApiFault('server'))

    await userEvent.click(screen.getByRole('button', { name: 'Bildirişi bağla' }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()

    vi.useFakeTimers()
    act(() => reportApiFault('network'))
    expect(screen.getByRole('alert')).toBeInTheDocument()
    act(() => vi.advanceTimersByTime(5000))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('stops listening once unmounted', () => {
    const { unmount } = render(<ApiFaultNotice />)
    unmount()

    expect(() => act(() => reportApiFault('server'))).not.toThrow()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})

describe('inside the admin panel', () => {
  it('a fault appears once, as an admin toast, not as the storefront notice', () => {
    render(
      <>
        <AdminToastProvider>
          <p>admin</p>
        </AdminToastProvider>
        <ApiFaultNotice />
      </>,
    )

    act(() => reportApiFault('server'))

    const alerts = screen.getAllByRole('alert')
    expect(alerts).toHaveLength(1)
    expect(alerts[0]).toHaveTextContent(API_FAULT_MESSAGES.server)
    expect(alerts[0].closest('[aria-live="polite"]')).not.toBeNull() // the admin toast region
  })
})
