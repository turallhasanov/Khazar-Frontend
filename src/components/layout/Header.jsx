import { Menu, Search, ShoppingBag, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { SearchModal } from '../search/SearchModal'

/** Giyim kategorileri — Mikro-Aşama 7'deki katalog filtreleriyle eşleştirilecek. */
const categories = [
  { id: 't-shirt', label: 'T-Shirt' },
  { id: 'sweatshirt', label: 'Sweatshirt' },
  { id: 'salvar', label: 'Şalvar' },
  { id: 'qadin-geyimi', label: 'Qadın Geyimi' },
  { id: 'kisi-geyimi', label: 'Kişi Geyimi' },
  { id: 'yeni-gelenler', label: 'Yeni Gələnlər' },
]

const drawerLinkClass =
  'block py-2 text-sm uppercase tracking-[0.2em] text-ink-700 transition-colors hover:text-clay-600'

function MobileDrawer({ open, onClose }) {
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
        className="absolute inset-0 bg-ink-900/40"
      />
      <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-linen-50 px-8 py-6 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="font-display text-lg tracking-wide">Khazar</span>
          <button
            type="button"
            aria-label="Bağla"
            onClick={onClose}
            className="p-1 text-ink-500 transition-colors hover:text-ink-900"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <nav className="mt-10 flex flex-col gap-1">
          {categories.map((category) => (
            <NavLink
              key={category.id}
              to={`/katalog?kateqoriya=${category.id}`}
              onClick={onClose}
              className={drawerLinkClass}
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
          <span className="mt-4 block text-xs uppercase tracking-[0.2em] text-ink-400">
            Giriş / Qeydiyyat
          </span>
        </div>
      </div>
    </div>
  )
}

/**
 * Mikro-Aşama 2: Header & Navigation Bar.
 * Referans estetik: bej zemin, sol hamburger + "Kataloq", ortada logo,
 * sağda "Giriş / Qeydiyyat" + sepet rozeti. Tamamen hazır giyim odaklı.
 */
export function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { totalItemsCount, openCart } = useCart()

  return (
    <>
      <header className="border-b border-linen-200 bg-linen-50">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          {/* Sol: hamburger + kataloq */}
          <div className="flex items-center gap-5">
            <button
              type="button"
              aria-label="Menyunu aç"
              onClick={() => setDrawerOpen(true)}
              className="p-1 text-ink-900 transition-colors hover:text-clay-600"
            >
              <Menu size={20} strokeWidth={1.5} />
            </button>
            <NavLink
              to="/katalog"
              className="hidden text-[11px] font-medium uppercase tracking-[0.3em] text-ink-700 transition-colors hover:text-clay-600 sm:block"
            >
              Kataloq
            </NavLink>
          </div>

          {/* Orta: logo (mobilde sol dizilime karışmaması için küçük) */}
          <Link
            to="/"
            className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-center leading-none"
          >
            <span className="font-display text-xl tracking-[0.08em] text-ink-900 sm:text-2xl">
              Khazar
            </span>
            <span className="mt-0.5 block text-[7px] uppercase tracking-[0.5em] text-ink-400 sm:text-[8px]">
              Textile
            </span>
          </Link>

          {/* Sağ: giriş + arama + sepet */}
          <div className="flex items-center gap-6">
            <span className="hidden cursor-pointer text-[11px] font-medium uppercase tracking-[0.2em] text-ink-700 transition-colors hover:text-clay-600 sm:block">
              Giriş / Qeydiyyat
            </span>
            <button
              type="button"
              aria-label="Axtarışı aç"
              onClick={() => setSearchOpen(true)}
              className="p-1 text-ink-900 transition-colors hover:text-clay-600"
            >
              <Search size={20} strokeWidth={1.5} />
            </button>
            <button
              type="button"
              aria-label="Səbəti aç"
              onClick={openCart}
              className="relative p-1 text-ink-900 transition-colors hover:text-clay-600"
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              {totalItemsCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-clay-500 px-1 text-[9px] font-semibold text-linen-50">
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
