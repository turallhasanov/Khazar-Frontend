import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { CartDrawer } from '../cart/CartDrawer'
import { CartProvider } from '../../context/CartContext'
import { Footer } from './Footer.jsx'
import { Header } from './Header.jsx'

/** Rota değişiminde sayfayı en üste kaydırır (footer linkleri dahil). */
function ScrollToTop() {
  const { pathname, search } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname, search])
  return null
}

/**
 * Mikro-Aşama 1: Temel uygulama kabı (App Container).
 * Header — Mikro-Aşama 2 | Footer — Mikro-Aşama 3.
 */
export function Layout() {
  return (
    <CartProvider>
      <div className="flex min-h-svh flex-col bg-linen-50 font-sans text-ink-900 antialiased">
        <ScrollToTop />
        <Header />
        <Outlet />
        <Footer />
        <CartDrawer />
      </div>
    </CartProvider>
  )
}
