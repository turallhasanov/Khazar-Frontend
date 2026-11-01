import { AlertTriangle, ChevronDown, MoreHorizontal, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { REVIEW_STATUS } from './reviews/reviewStatus.js'

/**
 * Admin panelinin ortak bileşenleri. Mağazanın dili korunur: keskin köşeler, 1px kenarlıklar,
 * büyük harfli mikro etiketler; durum renkleri anlamlıdır (clay = işlem bekliyor, sage = yayında).
 */

/** A ref that always holds the latest value, for event handlers registered once. */
function useLatest(value) {
  const ref = useRef(value)
  useEffect(() => {
    ref.current = value
  })
  return ref
}

export const microLabelClass = 'text-[10px] font-medium uppercase tracking-[0.3em] text-ink-400'

const focusRing =
  'focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-clay-500'

const buttonBase = `inline-flex shrink-0 items-center justify-center gap-2 border font-medium uppercase transition-[background-color,border-color,color,transform] duration-200 active:translate-y-px disabled:pointer-events-none disabled:opacity-40 ${focusRing}`

const buttonSizes = {
  sm: 'h-8 px-3 text-[10px] tracking-[0.2em]',
  md: 'h-10 px-5 text-[10px] tracking-[0.25em]',
  icon: 'h-8 w-8 text-[10px]',
}

const buttonVariants = {
  primary: 'border-ink-900 bg-ink-900 text-linen-50 hover:border-ink-700 hover:bg-ink-700',
  secondary: 'border-ink-900/20 bg-transparent text-ink-700 hover:border-ink-900 hover:text-ink-900',
  ghost: 'border-transparent bg-transparent text-ink-500 hover:text-ink-900',
  approve: 'border-sage-600/50 bg-transparent text-sage-700 hover:border-sage-600 hover:bg-sage-600 hover:text-linen-50',
  reject: 'border-clay-600/40 bg-transparent text-clay-600 hover:border-clay-600 hover:bg-clay-600 hover:text-linen-50',
  // Irreversible actions (delete): solid clay, so they never read like a routine button.
  danger: 'border-clay-600 bg-clay-600 text-linen-50 hover:border-clay-700 hover:bg-clay-700',
}

export function Button({ variant = 'secondary', size = 'md', className = '', type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={`${buttonBase} ${buttonSizes[size]} ${buttonVariants[variant]} ${className}`}
      {...props}
    />
  )
}

// aria-invalid (set through FormField's control props) turns the border clay.
const fieldBase =
  'w-full border border-ink-900/15 bg-linen-50 px-3 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-400 hover:border-ink-900/30 focus:border-ink-900 disabled:cursor-not-allowed disabled:bg-linen-100 disabled:text-ink-500 aria-[invalid=true]:border-clay-600'
const fieldClass = `h-10 ${fieldBase}`

export function TextInput({ className = '', ...props }) {
  return <input className={`${fieldClass} ${className}`} {...props} />
}

export function TextArea({ className = '', ...props }) {
  return <textarea className={`${fieldBase} resize-y py-2.5 leading-relaxed ${className}`} {...props} />
}

export function Select({ className = '', children, ...props }) {
  return (
    <span className={`relative block ${className}`}>
      <select className={`${fieldClass} cursor-pointer appearance-none pr-9`} {...props}>
        {children}
      </select>
      <ChevronDown
        size={14}
        strokeWidth={1.5}
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-400"
      />
    </span>
  )
}

/** Labelled control for the filter bar: the micro label sits above the input. */
export function FilterField({ label, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className={`${microLabelClass} mb-1.5 block`}>{label}</span>
      {children}
    </label>
  )
}

export function StatusBadge({ status, className = '' }) {
  const meta = REVIEW_STATUS[status] ?? REVIEW_STATUS.Pending
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap border px-2 py-1 text-[9px] font-medium uppercase tracking-[0.22em] transition-colors duration-300 ${meta.badge} ${className}`}
    >
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  )
}

const TONE_BADGES = {
  clay: { badge: 'border-clay-500/40 bg-clay-50 text-clay-700', dot: 'bg-clay-500' },
  sage: { badge: 'border-sage-600/40 bg-sage-100 text-sage-700', dot: 'bg-sage-600' },
  ink: { badge: 'border-ink-900/20 bg-linen-100 text-ink-700', dot: 'bg-ink-900' },
  muted: { badge: 'border-ink-900/15 bg-linen-100 text-ink-500', dot: 'bg-ink-400' },
}

/** Status pill in the review badge's style for any state: tone is clay (needs action), sage (live), ink or muted. */
export function ToneBadge({ tone = 'muted', children, className = '' }) {
  const meta = TONE_BADGES[tone] ?? TONE_BADGES.muted
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap border px-2 py-1 text-[9px] font-medium uppercase tracking-[0.22em] ${meta.badge} ${className}`}
    >
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {children}
    </span>
  )
}

/** Dashed empty / error block of the admin lists. */
export function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="mt-8 flex animate-fade-up flex-col items-center border border-dashed border-ink-900/15 px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-ink-900/10 bg-linen-100 text-ink-500">
        <Icon size={20} strokeWidth={1.25} />
      </span>
      <p className="mt-5 font-display text-xl text-ink-900">{title}</p>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-500">{text}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

/** Clay notice above a list whose refresh failed while older data stays on screen. */
export function StaleNotice({ children = 'Siyahı yenilənmədi; ekranda son yüklənmiş məlumatlar göstərilir.' }) {
  return (
    <p role="alert" className="mt-6 flex items-center gap-2 border border-clay-600/30 bg-clay-50 px-4 py-3 text-xs text-clay-700">
      <AlertTriangle size={14} strokeWidth={1.75} />
      {children}
    </p>
  )
}

/** Initial avatar: accounts have no profile photos. */
export function Avatar({ name, size = 'md' }) {
  const sizeClass = size === 'lg' ? 'h-12 w-12 text-lg' : 'h-9 w-9 text-sm'
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full border border-ink-900/10 bg-linen-100 font-display text-ink-700 ${sizeClass}`}
    >
      {name?.trim().charAt(0).toUpperCase() || '?'}
    </span>
  )
}

export function AdminPageHeader({ eyebrow, title, description, actions }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <p className={microLabelClass}>{eyebrow}</p>}
        <h1 className="mt-2 font-display text-3xl tracking-[0.01em] text-ink-900 md:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  )
}

/**
 * Slide-over panel (the same motion as the storefront cart drawer). Always mounted so it can animate out;
 * while closed it is inert. Escape closes it; focus moves into the panel and back to the opener on close.
 */
export function Drawer({ open, onClose, side = 'right', label, widthClass = 'max-w-md', children }) {
  const panelRef = useRef(null)
  const onCloseRef = useLatest(onClose)

  // Depends on `open` only: callers pass a new onClose on every render, and re-running would steal focus from
  // whatever input is being typed in.
  useEffect(() => {
    if (!open) return undefined
    const opener = document.activeElement
    panelRef.current?.focus()
    document.documentElement.style.overflow = 'hidden'
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onCloseRef.current()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.documentElement.style.overflow = ''
      if (opener instanceof HTMLElement) opener.focus()
    }
  }, [open, onCloseRef])

  const hiddenTransform = side === 'right' ? 'translate-x-full' : '-translate-x-full'

  // Portalled to <body>: an animated ancestor (the page's fade-up) would otherwise become the containing block of
  // this "fixed" layer and push it under the sticky topbar.
  return createPortal(
    // overflow-hidden clips the closed, off-screen panel; without it the page scrolls sideways.
    <div className={`fixed inset-0 z-50 overflow-hidden ${open ? '' : 'pointer-events-none'}`} inert={!open}>
      <button
        type="button"
        aria-label="Bağla"
        tabIndex={-1}
        onClick={onClose}
        className={`absolute inset-0 bg-ink-900/40 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={`absolute inset-y-0 ${side === 'right' ? 'right-0' : 'left-0'} flex w-full ${widthClass} flex-col bg-linen-50 shadow-2xl outline-none transition-transform duration-300 ease-soft ${
          open ? 'translate-x-0' : hiddenTransform
        }`}
      >
        {children}
      </div>
    </div>,
    document.body,
  )
}

export function DrawerCloseButton({ onClick }) {
  return (
    <button
      type="button"
      aria-label="Bağla"
      onClick={onClick}
      className={`p-1.5 text-ink-400 transition-colors hover:text-ink-900 ${focusRing}`}
    >
      <X size={18} strokeWidth={1.5} />
    </button>
  )
}

/**
 * Form row: label (with a required mark), the control, then the error or the hint. `children` is a function that
 * receives the props to spread on the control (id, aria-invalid, aria-describedby), so screen readers read the error.
 */
export function FormField({ label, required = false, error, hint, counter, className = '', children }) {
  const id = useId()
  const messageId = `${id}-message`
  const message = error || hint
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className={microLabelClass}>
          {label}
          {required && <span aria-hidden="true" className="ml-1 text-clay-600">*</span>}
        </label>
        {counter && <span className="text-[10px] tabular-nums text-ink-400">{counter}</span>}
      </div>
      {children({ id, 'aria-invalid': error ? true : undefined, 'aria-describedby': message ? messageId : undefined })}
      {message && (
        <p
          id={messageId}
          className={`mt-1.5 text-[11px] leading-snug ${error ? 'animate-fade-in text-clay-600' : 'text-ink-400'}`}
        >
          {message}
        </p>
      )}
    </div>
  )
}

/**
 * Centered confirmation for irreversible or important actions. Focus starts on "Cancel" so Enter never deletes by
 * accident; Escape cancels unless the action is running.
 */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  cancelLabel = 'Ləğv et',
  tone = 'danger',
  busy = false,
  onConfirm,
  onCancel,
}) {
  const panelRef = useRef(null)
  const titleId = useId()
  const latest = useLatest({ busy, onCancel })

  useEffect(() => {
    if (!open) return undefined
    const opener = document.activeElement
    panelRef.current?.querySelector('[data-cancel]')?.focus()
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        // Capture phase + stopPropagation: a drawer underneath must not close on the same Escape.
        event.stopPropagation()
        if (!latest.current.busy) latest.current.onCancel()
      }
    }
    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      if (opener instanceof HTMLElement) opener.focus()
    }
  }, [open, latest])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label={cancelLabel}
        tabIndex={-1}
        onClick={busy ? undefined : onCancel}
        className="absolute inset-0 animate-fade-in bg-ink-900/50 backdrop-blur-[2px]"
      />
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-md animate-toast-in border border-ink-900/10 bg-linen-50 p-6 shadow-2xl"
      >
        <div className="flex gap-4">
          {tone === 'danger' && (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-clay-50 text-clay-600">
              <AlertTriangle size={18} strokeWidth={1.5} />
            </span>
          )}
          <div className="min-w-0">
            <h2 id={titleId} className="font-display text-xl leading-snug text-ink-900">
              {title}
            </h2>
            <div className="mt-2 text-sm leading-relaxed text-ink-500">{children}</div>
          </div>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button data-cancel onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} disabled={busy}>
            {busy ? 'Gözləyin…' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

/**
 * "⋯" row menu. Items: { label, icon, onSelect, tone: 'danger', disabled, hint }. A disabled item stays visible and
 * shows `hint` (why it is unavailable) instead of disappearing. Escape, outside clicks and ↑/↓ work as expected.
 */
export function ActionMenu({ label, items, align = 'right' }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return undefined
    rootRef.current?.querySelector('[role=menuitem]:not([disabled])')?.focus()
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        setOpen(false)
        rootRef.current?.querySelector('button')?.focus()
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault()
        const enabled = [...rootRef.current.querySelectorAll('[role=menuitem]:not([disabled])')]
        const index = enabled.indexOf(document.activeElement)
        const next = event.key === 'ArrowDown' ? index + 1 : index - 1
        enabled[(next + enabled.length) % enabled.length]?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown, true)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative" onClick={(event) => event.stopPropagation()}>
      <Button
        size="icon"
        variant="ghost"
        aria-label={label}
        title={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((current) => !current)}
        className={open ? 'text-ink-900' : ''}
      >
        <MoreHorizontal size={16} strokeWidth={1.5} />
      </Button>
      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label={label}
          className={`absolute top-full z-40 mt-1 w-60 animate-toast-in border border-ink-900/10 bg-linen-50 py-1.5 shadow-xl shadow-ink-900/10 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {items.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  setOpen(false)
                  item.onSelect()
                }}
                className={`flex w-full items-start gap-3 px-4 py-2.5 text-left text-sm outline-none transition-colors focus-visible:bg-linen-100 enabled:hover:bg-linen-100 disabled:cursor-not-allowed ${
                  item.tone === 'danger' ? 'text-clay-600' : 'text-ink-700'
                } ${item.disabled ? 'opacity-50' : ''}`}
              >
                {Icon && <Icon size={15} strokeWidth={1.5} className="mt-0.5 shrink-0" />}
                <span className="min-w-0">
                  {item.label}
                  {item.hint && <span className="mt-0.5 block text-[11px] leading-snug text-ink-400">{item.hint}</span>}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

/**
 * Row of count cells that double as a filter (same look as the review status strip).
 * cells: [{ value, label, count, hint, accent: 'clay' | 'sage' | 'ink' }]
 */
export function StatStrip({ cells, value, onChange, label }) {
  const bars = { clay: 'bg-clay-500', sage: 'bg-sage-600', ink: 'bg-ink-900', muted: 'bg-ink-400' }
  return (
    <div
      role="group"
      aria-label={label}
      className={`grid grid-cols-2 gap-px border border-linen-200 bg-linen-200 ${cells.length === 4 ? 'sm:grid-cols-4' : 'sm:grid-cols-3'}`}
    >
      {cells.map((cell) => {
        const active = value === cell.value
        return (
          <button
            key={cell.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(cell.value)}
            className={`group relative flex flex-col items-start px-5 pb-5 pt-6 text-left transition-colors duration-200 focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-2 focus-visible:outline-clay-500 ${
              active ? 'bg-linen-100' : 'bg-linen-50 hover:bg-linen-100'
            }`}
          >
            <span
              aria-hidden="true"
              className={`absolute inset-x-0 top-0 h-0.5 origin-left transition-transform duration-300 ease-soft ${bars[cell.accent ?? 'ink']} ${
                active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-[0.15]'
              }`}
            />
            <span className={microLabelClass}>{cell.label}</span>
            <span className={`mt-3 font-display text-4xl leading-none tabular-nums ${cell.accent === 'clay' && cell.count > 0 ? 'text-clay-600' : 'text-ink-900'}`}>
              {cell.count}
            </span>
            {cell.hint && <span className="mt-2 text-[11px] text-ink-400">{cell.hint}</span>}
          </button>
        )
      })}
    </div>
  )
}
