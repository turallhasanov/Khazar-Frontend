import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { CartDrawer } from '../cart/CartDrawer'
import { AuthProvider } from '../../context/AuthContext'
import { CartProvider } from '../../context/CartContext'
import { ProductsProvider } from '../../context/ProductsContext'
import { SiteContentProvider } from '../../context/SiteContentContext'
import { WishlistProvider } from '../../context/WishlistContext'
import { Footer } from './Footer.jsx'
import { Header } from './Header.jsx'
import { WishlistDrawer } from '../wishlist/WishlistDrawer.jsx'

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
  const { pathname } = useLocation()
  return (
    // AuthProvider is outermost so every page (checkout included) can read the signed-in user.
    // ProductsProvider wraps the wishlist, which resolves its stored ids against the API catalog.
    <AuthProvider>
      <ProductsProvider>
        <CartProvider>
          <WishlistProvider>
            <SiteContentProvider>
              <div className="flex min-h-svh flex-col bg-linen-50 font-sans text-ink-900 antialiased">
                <ScrollToTop />
                <Header />
                {/* Keyed by path: each page fades in instead of snapping (query changes, e.g. filters, do not). */}
                <div key={pathname} className="flex flex-1 animate-page-in flex-col">
                  <Outlet />
                </div>
                <Footer />
                <CartDrawer />
                <WishlistDrawer />
              </div>
            </SiteContentProvider>
          </WishlistProvider>
        </CartProvider>
      </ProductsProvider>
    </AuthProvider>
  )
}
