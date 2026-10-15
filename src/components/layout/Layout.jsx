import { Outlet } from 'react-router-dom'
import { CartDrawer } from '../cart/CartDrawer'
import { CartProvider } from '../../context/CartContext'
import { Footer } from './Footer.jsx'
import { Header } from './Header.jsx'

/**
 * Mikro-Aşama 1: Temel uygulama kabı (App Container).
 * Header — Mikro-Aşama 2 | Footer — Mikro-Aşama 3.
 */
export function Layout() {
  return (
    <CartProvider>
      <div className="flex min-h-svh flex-col bg-linen-50 font-sans text-ink-900 antialiased">
        <Header />
        <Outlet />
        <Footer />
        <CartDrawer />
      </div>
    </CartProvider>
  )
}
