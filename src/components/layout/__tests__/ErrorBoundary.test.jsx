import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ErrorBoundary } from '../ErrorBoundary.jsx'

function Broken() {
  throw new Error('product.variants is undefined')
}

function GoTo({ path }) {
  const navigate = useNavigate()
  return <button type="button" onClick={() => navigate(path)}>go {path}</button>
}

function renderApp(initialPath) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <GoTo path="/katalog" />
      <ErrorBoundary>
        <Routes>
          <Route path="/mehsul/:slug" element={<Broken />} />
          <Route path="/katalog" element={<h2>Kataloq</h2>} />
        </Routes>
      </ErrorBoundary>
    </MemoryRouter>,
  )
}

describe('ErrorBoundary (storefront)', () => {
  let consoleError

  beforeEach(() => {
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('renders the page normally when nothing throws', () => {
    renderApp('/katalog')

    expect(screen.getByRole('heading', { name: 'Kataloq' })).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows the "Sistemdə xəta baş verdi" fallback with its two ways out', () => {
    renderApp('/mehsul/yun-palto')

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Sistemdə xəta baş verdi' })).toBeInTheDocument()
    expect(screen.getByText(/Səbətiniz və hesabınız təhlükəsizdir/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Səhifəni yenilə' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Ana səhifəyə qayıt' })).toBeEnabled()
  })

  it('shows the error message in development builds and logs it', () => {
    renderApp('/mehsul/yun-palto')

    expect(screen.getByText('product.variants is undefined')).toBeInTheDocument()
    expect(consoleError).toHaveBeenCalledWith('[ErrorBoundary] UI render failed:', expect.any(Error), expect.any(String))
  })

  it('recovers when the shopper navigates elsewhere', async () => {
    renderApp('/mehsul/yun-palto')

    await userEvent.click(screen.getByRole('button', { name: 'go /katalog' }))

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Kataloq' })).toBeInTheDocument()
  })
})
