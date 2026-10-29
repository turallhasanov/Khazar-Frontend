import { Heart, Menu, Search, ShoppingBag, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useProducts } from '../../context/ProductsContext'
import { useContentSection } from '../../context/SiteContentContext'
import { useWishlist } from '../../context/WishlistContext'
import { SearchModal } from '../search/SearchModal'

const categoryPath = (category) => `/katalog?kateqoriya=${encodeURIComponent(category.slug)}`

const drawerLinkClass =
  'block py-2 text-[13px] font-medium uppercase tracking-[0.14em] text-ink-700 transition-colors hover:text-clay-600'

function MobileDrawer({ open, onClose }) {
  const { user, logout } = useAuth()
  const { categories } = useProducts()

  useEffect(() => {
    if (!open) return undefined
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Menyu">
      <button
        type="button"
        aria-label="Menyunu bağla"
        onClick={onClose}
        className="absolute inset-0 animate-fade-in bg-ink-900/40"
      />
      <div className="absolute inset-y-0 left-0 flex w-[min(20rem,85vw)] animate-drawer-in flex-col overflow-y-auto bg-linen-50 px-8 py-6">
        <div className="flex items-center justify-between">
          <span className="font-display text-xl tracking-[0.04em]">Khazar</span>
          <button
            type="button"
            aria-label="Bağla"
            onClick={onClose}
            className="-mr-2 flex h-11 w-11 items-center justify-center text-ink-500 transition-colors hover:text-ink-900"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <nav className="mt-10 flex flex-col gap-1" aria-label="Kateqoriyalar">
          {categories.map((category) => (
            <NavLink
              key={category.id}
              to={categoryPath(category)}
              onClick={onClose}
              className="block py-2 font-display text-2xl font-light text-ink-900 transition-colors hover:text-clay-600"
            >
              {category.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-linen-200 pt-6">
          <NavLink to="/" end onClick={onClose} className={drawerLinkClass}>
            Ana Səhifə
          </NavLink>
          <NavLink to="/katalog" onClick={onClose} className={drawerLinkClass}>
            Kataloq
          </NavLink>
          <NavLink to="/sebet" onClick={onClose} className={drawerLinkClass}>
            Səbət
          </NavLink>
          {user ? (
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.14em] text-ink-500">{user.firstName}</span>
              <button
                type="button"
                onClick={() => {
                  logout()
                  onClose()
                }}
                className="text-xs uppercase tracking-[0.14em] text-ink-700 transition-colors hover:text-clay-600"
              >
                Çıxış
              </button>
            </div>
          ) : (
            <NavLink to="/giris" onClick={onClose} className={`${drawerLinkClass} mt-4`}>
              Giriş / Qeydiyyat
            </NavLink>
          )}
        </div>
      </div>
    </div>
  )
}

const iconButtonClass =
  'relative flex h-10 w-10 items-center justify-center text-ink-900 transition-colors duration-300 hover:text-clay-600'

const navLinkClass = ({ isActive }) =>
  `text-[12px] font-medium uppercase tracking-[0.14em] transition-colors duration-300 hover:text-clay-600 ${
    isActive ? 'text-clay-600' : 'text-ink-700'
  }`

/**
 * Header — yapışkan, krem zemin. Kaydırınca ince alt çizgi belirir ve yükseklik bir kademe azalır.
 * Sol: hamburger (xl altı) + kataloq + kategori menüsü (xl+) · Orta: logo · Sağ: giriş, axtarış, istək siyahısı, səbət.
 */
export function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { totalItemsCount, openCart } = useCart()
  const { count: wishlistCount, openWishlist } = useWishlist()
  const { user, logout } = useAuth()
  // Desktop links after "Kataloq", chosen in the admin panel ("site" section); the drawer lists the categories.
  const headerLinks = (useContentSection('site')?.headerLinks ?? []).filter((link) => link.label && link.to)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header
        className={`sticky top-0 z-40 border-b bg-linen-50 transition-[border-color] duration-300 ${
          scrolled ? 'border-linen-200' : 'border-transparent'
        }`}
      >
        {/* 1fr / auto / 1fr grid: logo ortada qalır, amma absolute deyil — gap-x loqo ilə ikonlar arasında
            minimum məsafəni zəmanət edir; dar ekranda logo üst-üstə düşmək əvəzinə sola sürüşür. */}
        <div
          className={`shell grid grid-cols-[1fr_auto_1fr] items-center gap-x-3 transition-[height] duration-300 sm:gap-x-6 ${
            scrolled ? 'h-16' : 'h-16 lg:h-20'
          }`}
        >
          {/* Sol: hamburger + kataloq / masaüstü kateqoriyalar */}
          <div className="flex items-center gap-4 justify-self-start xl:gap-7">
            <button
              type="button"
              aria-label="Menyunu aç"
              onClick={() => setDrawerOpen(true)}
              className={`${iconButtonClass} -ml-2.5 xl:hidden`}
            >
              <Menu size={20} strokeWidth={1.5} />
            </button>
            <NavLink to="/katalog" end className={(state) => `hidden sm:block ${navLinkClass(state)}`}>
              Kataloq
            </NavLink>
            <nav aria-label="Kateqoriyalar" className="hidden items-center gap-7 xl:flex">
              {headerLinks.map((link) => (
                <Link
                  key={`${link.label}-${link.to}`}
                  to={link.to}
                  className="text-[12px] font-medium uppercase tracking-[0.14em] text-ink-700 transition-colors duration-300 hover:text-clay-600"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Orta: logo */}
          <Link to="/" className="whitespace-nowrap text-center leading-none" aria-label="Khazar — ana səhifə">
            <span className="font-display text-xl font-normal tracking-[0.06em] text-ink-900 max-[359px]:text-lg sm:text-[1.625rem]">
              Khazar
            </span>
            <span className="mt-1 block text-[8px] font-medium uppercase tracking-[0.42em] text-ink-500 sm:text-[9px]">
              Textile
            </span>
          </Link>

          {/* Sağ: giriş + axtarış + istək siyahısı + səbət */}
          <div className="-mr-2.5 flex items-center gap-0.5 justify-self-end sm:gap-2">
            {user ? (
              <div className="mr-3 hidden items-center gap-3 text-[12px] font-medium uppercase tracking-[0.14em] md:flex">
                <span className="text-ink-500">Salam, {user.firstName}</span>
                <button
                  type="button"
                  onClick={logout}
                  className="uppercase tracking-[0.14em] text-ink-700 transition-colors hover:text-clay-600"
                >
                  Çıxış
                </button>
              </div>
            ) : (
              <NavLink to="/giris" className={(state) => `mr-3 hidden md:block ${navLinkClass(state)}`}>
                Giriş / Qeydiyyat
              </NavLink>
            )}
            <button type="button" aria-label="Axtarışı aç" onClick={() => setSearchOpen(true)} className={iconButtonClass}>
              <Search size={19} strokeWidth={1.5} />
            </button>
            <button type="button" aria-label="İstək siyahısını aç" onClick={openWishlist} className={iconButtonClass}>
              <Heart size={19} strokeWidth={1.5} />
              {wishlistCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink-900 px-1 text-[9px] font-semibold text-linen-50">
                  {wishlistCount}
                </span>
              )}
            </button>
            <button type="button" aria-label="Səbəti aç" onClick={openCart} className={iconButtonClass}>
              <ShoppingBag size={19} strokeWidth={1.5} />
              {totalItemsCount > 0 && (
                // Keyed by the count, so the badge "breathes" each time an item is added.
                <span
                  key={totalItemsCount}
                  className="absolute right-0.5 top-0.5 flex h-4 min-w-4 animate-heart-pop items-center justify-center rounded-full bg-clay-600 px-1 text-[9px] font-semibold text-linen-50"
                >
                  {totalItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
