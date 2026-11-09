import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useEffect } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { AdminToastProvider, useAdminToast } from '../AdminToasts.jsx'

let api

/** Hands the provider's API to the test once mounted. */
function Capture({ onReady }) {
  const value = useAdminToast()
  useEffect(() => onReady(value), [onReady, value])
  return null
}

function renderToasts() {
  render(
    <AdminToastProvider>
      <Capture onReady={(value) => { api = value }} />
    </AdminToastProvider>,
  )
}

describe('AdminToasts', () => {
  it('merges an identical plain error (interceptor + page reporting the same failure)', () => {
    renderToasts()

    act(() => {
      api.toast({ message: 'Serverə qoşulmaq mümkün olmadı.', tone: 'error' })
      api.toast({ message: 'Serverə qoşulmaq mümkün olmadı.', tone: 'error' })
    })

    expect(screen.getAllByRole('alert')).toHaveLength(1)
  })

  it('never merges toasts that carry an action such as "Geri al"', () => {
    renderToasts()
    const undo = vi.fn()

    act(() => {
      api.toast({ message: 'Məhsul silindi.', tone: 'error', action: { label: 'Geri al', onClick: undo } })
      api.toast({ message: 'Məhsul silindi.', tone: 'error', action: { label: 'Geri al', onClick: undo } })
    })

    expect(screen.getAllByRole('button', { name: 'Geri al' })).toHaveLength(2)
  })

  it('does not merge success toasts', () => {
    renderToasts()

    act(() => {
      api.toast({ message: 'Saxlanıldı.' })
      api.toast({ message: 'Saxlanıldı.' })
    })

    expect(screen.getAllByRole('status')).toHaveLength(2)
  })

  it('runs the action and closes the toast', async () => {
    renderToasts()
    const undo = vi.fn()
    act(() => api.toast({ message: 'Rəy silindi.', action: { label: 'Geri al', onClick: undo } }))

    await userEvent.click(screen.getByRole('button', { name: 'Geri al' }))

    expect(undo).toHaveBeenCalledOnce()
    expect(screen.queryByText('Rəy silindi.')).not.toBeInTheDocument()
  })
})
