import { NavLink } from 'react-router-dom'

function navClass({ isActive }) {
  return isActive
    ? 'text-neutral-900 font-medium'
    : 'text-neutral-500 hover:text-neutral-900'
}

export function Header() {
  return (
    <header className="border-b border-neutral-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <NavLink to="/" end className="text-lg font-medium tracking-tight">
          Khazar
        </NavLink>
        <nav className="flex gap-6 text-sm">
          <NavLink to="/" className={navClass} end>
            Ana
          </NavLink>
          <NavLink to="/katalog" className={navClass}>
            Kataloq
          </NavLink>
          <NavLink to="/sebet" className={navClass}>
            Səbət
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
