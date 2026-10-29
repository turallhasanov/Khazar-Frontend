import {
  ArrowUpRight,
  BookOpen,
  FileText,
  HelpCircle,
  Images,
  Inbox,
  LogOut,
  Mail,
  Menu,
  MessageSquareText,
  Package,
  ShoppingBag,
  Tags,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { AdminInboxProvider, useAdminInbox } from '../../context/AdminInboxContext'
import { AdminReviewsProvider, useAdminReviews } from '../../context/AdminReviewsContext'
import { AuthProvider, useAuth } from '../../context/AuthContext'
import { getAdminSession } from '../../services/adminService.js'
import { ApiError } from '../../services/api.js'
import { describeAuthError } from '../../services/authErrors.js'
import { AuthAlert, AuthField, AuthShell, authButtonClass } from '../auth/AuthShell.jsx'
import { AdminToastProvider } from './AdminToasts.jsx'
import { Avatar, Drawer, DrawerCloseButton, microLabelClass } from './adminUi.jsx'

/** Sidebar sections. Every page reads and writes the API; nothing in the panel is stored only in the browser. */
const NAV_GROUPS = [
  {
    label: 'Satış',
    items: [
      { to: '/admin/sifarisler', label: 'Sifarişlər', icon: ShoppingBag },
      { to: '/admin/reyler', label: 'Rəylər', icon: MessageSquareText, badge: 'pendingReviews' },
    ],
  },
  {
    label: 'Kataloq',
    items: [
      { to: '/admin/mehsullar', label: 'Məhsullar', icon: Package },
      { to: '/admin/kateqoriyalar', label: 'Kateqoriyalar', icon: Tags },
    ],
  },
  {
    label: 'Məzmun',
    items: [
      { to: '/admin/mezmun', label: 'Səhifələr', icon: FileText },
      { to: '/admin/lookbook', label: 'Lookbook', icon: Images },
      { to: '/admin/jurnal', label: 'Jurnal', icon: BookOpen },
      { to: '/admin/faq', label: 'FAQ', icon: HelpCircle },
    ],
  },
  {
    label: 'Müştərilər',
    items: [
      { to: '/admin/mesajlar', label: 'Mesajlar', icon: Inbox, badge: 'unreadMessages' },
      { to: '/admin/abuneciler', label: 'Abunəçilər', icon: Mail },
    ],
  },
]

const NAV_ITEMS = NAV_GROUPS.flatMap((group) => group.items)

const screenClass = 'flex min-h-svh flex-col bg-linen-50 font-sans text-ink-900 antialiased'

/** /admin/* — outside the storefront layout (no cart, search or footer), with its own providers. */
export function AdminRoot() {
  return (
    <AuthProvider>
      <AdminLayout />
    </AuthProvider>
  )
}

/**
 * Signs in through POST /api/auth/login and opens the panel only after GET /api/admin/session confirms
 * the account is a platform admin. The check runs on the server, so editing the stored session cannot unlock it.
 */
function AdminLayout() {
  const { user, logout } = useAuth()
  const [attempt, setAttempt] = useState(0)
  // Result of the last admin check, tagged with the account and attempt it was made for.
  const [check, setCheck] = useState({ key: null, access: null })

  const userId = user?.id
  const checkKey = `${userId}:${attempt}`
  // login | checking | denied | unreachable | admin
  const access = !userId ? 'login' : check.key === checkKey ? check.access : 'checking'

  useEffect(() => {
    if (!userId) return undefined

    const controller = new AbortController()
    const settle = (result) => setCheck({ key: checkKey, access: result })
    getAdminSession({ signal: controller.signal })
      .then(() => settle('admin'))
      .catch((error) => {
        if (error.name === 'AbortError') return
        if (error instanceof ApiError && error.status === 403) settle('denied')
        else if (error instanceof ApiError && error.status === 401) settle('login')
        else settle('unreachable')
      })
    return () => controller.abort()
  }, [userId, checkKey])

  if (access === 'admin') {
    return (
      <AdminToastProvider>
        <AdminReviewsProvider>
          <AdminInboxProvider>
            <AdminShell />
          </AdminInboxProvider>
        </AdminReviewsProvider>
      </AdminToastProvider>
    )
  }

  let content
  if (access === 'login') {
    // A new attempt after sign-in, so the check runs again even when the same account signs back in.
    content = <AdminSignIn onSignedIn={() => setAttempt((current) => current + 1)} />
  } else if (access === 'checking') {
    content = <AuthShell eyebrow="Admin" title="Yoxlanılır…" description="Admin icazəniz yoxlanılır." />
  } else {
    const denied = access === 'denied'
    content = (
      <AuthShell
        eyebrow="Admin"
        title={denied ? 'İcazə yoxdur' : 'Serverə qoşulmaq mümkün olmadı'}
        description={
          denied
            ? `${user?.email} hesabının admin panelinə giriş icazəsi yoxdur.`
            : 'Admin icazəsi yoxlanıla bilmədi. Bir az sonra yenidən cəhd edin.'
        }
      >
        <button
          type="button"
          onClick={denied ? logout : () => setAttempt((current) => current + 1)}
          className={authButtonClass}
        >
          {denied ? 'Başqa hesabla daxil ol' : 'Yenidən cəhd et'}
        </button>
      </AuthShell>
    )
  }

  return (
    <div className={screenClass}>
      <header className="flex h-16 items-center justify-center border-b border-linen-200">
        <Wordmark />
      </header>
      <div className="flex flex-1 animate-fade-in">{content}</div>
    </div>
  )
}

function Wordmark({ caption = 'Textile' }) {
  return (
    <Link to="/" className="text-center leading-none">
      <span className="font-display text-xl tracking-[0.08em] text-ink-900">Khazar</span>
      <span className="mt-0.5 block text-[7px] uppercase tracking-[0.5em] text-ink-400">{caption}</span>
    </Link>
  )
}

function AdminShell() {
  const { pathname } = useLocation()
  const [navOpen, setNavOpen] = useState(false)
  const current = NAV_ITEMS.find((item) => pathname.startsWith(item.to))

  useEffect(() => {
    document.title = `${current?.label ?? 'Admin'} · Khazar Admin`
    window.scrollTo(0, 0)
  }, [current, pathname])

  return (
    <div className={`${screenClass} lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]`}>
      <aside className="sticky top-0 hidden h-svh border-r border-linen-200 bg-linen-100/60 lg:block">
        <SidebarContent />
      </aside>

      <Drawer open={navOpen} onClose={() => setNavOpen(false)} side="left" label="Admin menyusu" widthClass="max-w-72">
        <SidebarContent onNavigate={() => setNavOpen(false)} />
      </Drawer>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-linen-200 bg-linen-50/85 px-4 backdrop-blur-md sm:px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Menyunu aç"
              onClick={() => setNavOpen(true)}
              className="p-1.5 text-ink-900 transition-colors hover:text-clay-600 lg:hidden"
            >
              <Menu size={20} strokeWidth={1.5} />
            </button>
            <nav aria-label="Yol" className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em]">
              <span className="text-ink-400">Admin</span>
              <span aria-hidden="true" className="text-ink-400/60">/</span>
              <span className="text-ink-900">{current?.label}</span>
            </nav>
          </div>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-1.5 text-[10px] uppercase tracking-[0.3em] text-ink-500 transition-colors hover:text-clay-600"
          >
            Mağazaya bax
            <ArrowUpRight
              size={13}
              strokeWidth={1.5}
              className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </a>
        </header>

        <main key={pathname} className="flex-1 animate-fade-up px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function SidebarContent({ onNavigate }) {
  const { user, logout } = useAuth()
  const { reviews } = useAdminReviews()
  const { items: messages } = useAdminInbox()
  const badges = {
    pendingReviews: reviews.filter((review) => review.status === 'Pending').length,
    unreadMessages: messages.filter((message) => !message.isRead).length,
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto px-5 py-6">
      <div className="flex items-center justify-between">
        <Wordmark caption="Admin" />
        {onNavigate && <DrawerCloseButton onClick={onNavigate} />}
      </div>

      <nav aria-label="Admin bölmələri" className="mt-8">
        {NAV_GROUPS.map((group) => (
        <div key={group.label} className="mt-5 first:mt-0">
        <p className={`${microLabelClass} px-3`}>{group.label}</p>
        <div className="mt-2 flex flex-col gap-0.5">
        {group.items.map((item) => {
          const Icon = item.icon
          const count = item.badge ? badges[item.badge] : 0
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 px-3 py-2.5 text-[11px] uppercase tracking-[0.22em] transition-colors duration-200 ${
                  isActive ? 'bg-linen-50 text-ink-900' : 'text-ink-500 hover:bg-linen-50/60 hover:text-ink-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    aria-hidden="true"
                    className={`absolute inset-y-1.5 left-0 w-0.5 origin-center bg-ink-900 transition-transform duration-300 ease-soft ${
                      isActive ? 'scale-y-100' : 'scale-y-0'
                    }`}
                  />
                  <Icon size={15} strokeWidth={1.5} />
                  <span className="flex-1">{item.label}</span>
                  {count > 0 && (
                    <span
                      aria-label={`${count} ${item.badge === 'unreadMessages' ? 'oxunmamış' : 'gözləyən'}`}
                      className="flex h-5 min-w-5 items-center justify-center bg-clay-500 px-1.5 text-[9px] font-semibold tracking-normal text-linen-50"
                    >
                      {count}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          )
        })}
        </div>
        </div>
        ))}
      </nav>

      <div className="mt-auto border-t border-linen-200 pt-5">
        <div className="flex items-center gap-3">
          <Avatar name={user?.firstName} />
          <div className="min-w-0">
            <p className="truncate text-sm text-ink-900">{user?.firstName} {user?.lastName}</p>
            <p className="truncate text-[11px] text-ink-400">{user?.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={logout}
          className="mt-4 flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-ink-500 transition-colors hover:text-clay-600"
        >
          <LogOut size={13} strokeWidth={1.5} />
          Çıxış
        </button>
      </div>
    </div>
  )
}

/** Email + password sign-in; the layout re-checks admin access as soon as the new session is stored. */
function AdminSignIn({ onSignedIn }) {
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (submitting) return
    if (!form.email.trim() || !form.password) {
      setError('E-poçt və şifrəni daxil edin.')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      // On success this component unmounts: the layout switches to "checking" for the new session.
      await login({ email: form.email.trim(), password: form.password })
      onSignedIn()
    } catch (err) {
      setError(describeAuthError(err))
      setSubmitting(false)
    }
  }

  return (
    <AuthShell eyebrow="Admin" title="Admin paneli" description="Davam etmək üçün admin hesabınızla daxil olun.">
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <AuthField
          label="E-poçt"
          type="email"
          autoComplete="username"
          value={form.email}
          onChange={update('email')}
          placeholder="admin@khazar.az"
        />
        <AuthField
          label="Şifrə"
          type="password"
          autoComplete="current-password"
          value={form.password}
          onChange={update('password')}
        />
        <AuthAlert>{error}</AuthAlert>
        <button type="submit" disabled={submitting} className={authButtonClass}>
          {submitting ? 'Yoxlanılır…' : 'Daxil ol'}
        </button>
      </form>
    </AuthShell>
  )
}
