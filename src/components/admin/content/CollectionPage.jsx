import { AlertCircle, Eye, EyeOff, ExternalLink, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { useAdminToast } from '../AdminToasts.jsx'
import {
  ActionMenu,
  AdminPageHeader,
  Button,
  ConfirmDialog,
  Drawer,
  DrawerCloseButton,
  EmptyState,
  StaleNotice,
  ToneBadge,
  microLabelClass,
} from '../adminUi.jsx'
import { slugify } from '../products/productForm.js'
import { ListSkeleton } from '../reviews/ReviewsList.jsx'
import { formatTime, useAdminList } from '../useAdminList.js'
import { ApiError } from '../../../services/api.js'
import { describeContentError } from './contentErrors.js'
import { SchemaForm } from './SchemaForm.jsx'

const FLASH_MS = 1400
const SORT_STEP = 10

const byDisplayOrder = (a, b) => a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt)

/**
 * List + editor for a content collection (journal articles, lookbook looks, FAQ items): create, edit, publish or
 * hide, delete. Only published rows reach the storefront, in sort order. `config`:
 * { eyebrow, title, description, icon, noun, api, fields, emptyItem(nextSortOrder), toForm(item), itemTitle(item),
 *   itemSubtitle(item), thumbnail(item), previewPath(item), slugFrom, context, renderExtra({ value, onChange }) }.
 */
export function CollectionPage({ config }) {
  const { toast } = useAdminToast()
  const list = useAdminList(config.api.list)
  const [editor, setEditor] = useState({ open: false, item: null, key: 0 })
  const [deleting, setDeleting] = useState(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [flashId, setFlashId] = useState(null)

  const items = list.items
  const nextSortOrder = items.length ? Math.max(...items.map((item) => item.sortOrder)) + SORT_STEP : SORT_STEP
  const publishedCount = items.filter((item) => item.isPublished).length
  const ready = list.status === 'ready'
  const Icon = config.icon

  const flash = (id) => {
    setFlashId(id)
    setTimeout(() => setFlashId((current) => (current === id ? null : current)), FLASH_MS)
  }

  const openCreate = () => setEditor((current) => ({ open: true, item: null, key: current.key + 1 }))
  const openEdit = (item) => setEditor((current) => ({ open: true, item, key: current.key + 1 }))
  const closeEditor = () => setEditor((current) => ({ ...current, open: false }))

  const applySaved = (saved, created) => {
    list.setItems((current) =>
      (created ? [...current, saved] : current.map((item) => (item.id === saved.id ? saved : item))).sort(byDisplayOrder),
    )
    flash(saved.id)
  }

  const onSaved = (saved, created) => {
    closeEditor()
    applySaved(saved, created)
    toast({ message: `«${config.itemTitle(saved)}» ${created ? 'yaradıldı' : 'yadda saxlanıldı'}${saved.isPublished ? ' — saytda yeniləndi.' : ' (gizli).'}` })
  }

  const togglePublished = async (item) => {
    try {
      const saved = await config.api.update(item.id, { ...config.toForm(item), isPublished: !item.isPublished })
      applySaved(saved, false)
      toast({ message: saved.isPublished ? `«${config.itemTitle(saved)}» dərc olundu.` : `«${config.itemTitle(saved)}» saytdan gizlədildi.` })
    } catch (error) {
      toast({ message: describeContentError(error).message, tone: 'error' })
    }
  }

  const confirmDelete = async () => {
    const item = deleting
    setDeleteBusy(true)
    try {
      await config.api.remove(item.id)
      list.setItems((current) => current.filter((entry) => entry.id !== item.id))
      toast({ message: `«${config.itemTitle(item)}» silindi.` })
    } catch (error) {
      toast({ message: describeContentError(error).message, tone: 'error' })
      if (error instanceof ApiError && error.status === 404) list.reload()
    } finally {
      setDeleting(null)
      setDeleteBusy(false)
    }
  }

  const menuItems = (item) => [
    { label: 'Redaktə et', icon: Pencil, onSelect: () => openEdit(item) },
    item.isPublished
      ? { label: 'Saytdan gizlət', icon: EyeOff, hint: 'Silinmir, sonra yenidən dərc etmək olar', onSelect: () => togglePublished(item) }
      : { label: 'Dərc et', icon: Eye, onSelect: () => togglePublished(item) },
    {
      label: 'Saytda bax',
      icon: ExternalLink,
      disabled: !item.isPublished,
      hint: item.isPublished ? null : 'Gizli qeyd saytda görünmür',
      onSelect: () => window.open(config.previewPath(item), '_blank', 'noopener'),
    },
    { label: 'Sil', icon: Trash2, tone: 'danger', hint: 'Geri qaytarıla bilməz', onSelect: () => setDeleting(item) },
  ]

  const status = (item) => (item.isPublished ? <ToneBadge tone="sage">Dərc olunub</ToneBadge> : <ToneBadge>Gizli</ToneBadge>)

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        eyebrow={config.eyebrow}
        title={config.title}
        description={config.description}
        actions={
          <>
            {list.loadedAt && <span className="text-[11px] text-ink-400">Yeniləndi · {formatTime(list.loadedAt)}</span>}
            <Button size="sm" onClick={list.reload} disabled={list.refreshing || list.status === 'loading'} aria-label="Siyahını yenilə">
              <RefreshCw size={13} strokeWidth={1.75} className={list.refreshing ? 'animate-spin' : ''} />
              Yenilə
            </Button>
            <Button variant="primary" onClick={openCreate} disabled={!ready}>
              <Plus size={15} strokeWidth={1.75} />
              Yeni {config.noun}
            </Button>
          </>
        }
      />

      {ready && list.error && <StaleNotice />}
      {list.status === 'loading' && <ListSkeleton />}
      {list.status === 'error' && (
        <EmptyState
          icon={AlertCircle}
          title={list.error instanceof ApiError && list.error.status === 403 ? 'Admin icazəniz yoxdur' : 'Siyahı yüklənmədi'}
          text={list.error instanceof ApiError && list.error.status === 0 ? 'Serverə qoşulmaq mümkün olmadı.' : 'Bir az sonra yenidən cəhd edin.'}
          action={<Button onClick={list.reload}>Yenidən cəhd et</Button>}
        />
      )}

      {ready && items.length === 0 && (
        <EmptyState
          icon={Icon}
          title={`Hələ ${config.noun} yoxdur`}
          text="Yaratdığınız və dərc etdiyiniz qeydlər saytda dərhal görünür."
          action={
            <Button variant="primary" onClick={openCreate}>
              <Plus size={15} strokeWidth={1.75} />
              Yeni {config.noun}
            </Button>
          }
        />
      )}

      {ready && items.length > 0 && (
        <>
          <p className="mt-8 text-[11px] tabular-nums text-ink-500">
            {items.length} {config.noun} · {publishedCount} dərc olunub
          </p>
          <ul className="mt-3 divide-y divide-linen-200 border-y border-linen-200">
            {items.map((item) => {
              const thumbnail = config.thumbnail?.(item)
              return (
                <li
                  key={item.id}
                  className={`group flex items-center gap-4 py-3.5 transition-colors duration-200 hover:bg-linen-100/60 ${
                    flashId === item.id ? 'animate-row-flash' : ''
                  }`}
                >
                  <span className="hidden w-10 shrink-0 pl-2 text-sm tabular-nums text-ink-400 sm:block">{item.sortOrder}</span>
                  {thumbnail !== undefined && (
                    <span className="h-14 w-11 shrink-0 overflow-hidden border border-ink-900/10 bg-linen-100">
                      {thumbnail && <img src={thumbnail} alt="" loading="lazy" className="h-full w-full object-cover" />}
                    </span>
                  )}
                  <button type="button" onClick={() => openEdit(item)} className="min-w-0 flex-1 text-left">
                    <span className="block truncate text-sm text-ink-900 group-hover:underline group-hover:decoration-ink-900/30 group-hover:underline-offset-4">
                      {config.itemTitle(item)}
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-ink-400">{config.itemSubtitle(item)}</span>
                  </button>
                  <span className="hidden sm:block">{status(item)}</span>
                  <div className="flex shrink-0 gap-1 pr-1">
                    <Button size="icon" variant="ghost" aria-label={`Redaktə et: ${config.itemTitle(item)}`} title="Redaktə et" onClick={() => openEdit(item)} className="hidden sm:inline-flex">
                      <Pencil size={14} strokeWidth={1.5} />
                    </Button>
                    <ActionMenu label={`${config.itemTitle(item)} üçün əməliyyatlar`} items={menuItems(item)} />
                  </div>
                </li>
              )
            })}
          </ul>
        </>
      )}

      <CollectionEditorDrawer key={editor.key} open={editor.open} item={editor.item} config={config} nextSortOrder={nextSortOrder} onClose={closeEditor} onSaved={onSaved} />

      <ConfirmDialog
        open={Boolean(deleting)}
        title={`«${deleting ? config.itemTitle(deleting) : ''}» silinsin?`}
        confirmLabel="Sil"
        busy={deleteBusy}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      >
        Bu əməliyyat geri qaytarıla bilməz və qeyd saytdan dərhal çıxır. Yalnız müvəqqəti gizlətmək üçün «Saytdan gizlət»
        seçin.
      </ConfirmDialog>
    </div>
  )
}

function CollectionEditorDrawer({ open, item, config, nextSortOrder, onClose, onSaved }) {
  const created = !item
  const formRef = useRef(null)
  const [initial] = useState(() => (item ? config.toForm(item) : config.emptyItem(nextSortOrder)))
  const [value, setValue] = useState(initial)
  const [slugTouched, setSlugTouched] = useState(!created)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const dirty = JSON.stringify(value) !== JSON.stringify(initial)

  const change = (next) => {
    // The slug follows the title on a new record until the admin types one.
    if (config.slugFrom && next.slug !== value.slug) setSlugTouched(true)
    else if (config.slugFrom && !slugTouched) next = { ...next, slug: slugify(next[config.slugFrom] ?? '') }
    setValue(next)
    if (formError) setFormError(null)
  }

  const requestClose = () => {
    if (saving) return
    if (dirty) setConfirmDiscard(true)
    else onClose()
  }

  const save = async () => {
    if (saving) return
    setSaving(true)
    setErrors({})
    setFormError(null)
    try {
      const saved = created ? await config.api.create(value) : await config.api.update(item.id, value)
      onSaved(saved, created)
    } catch (error) {
      const { field, message } = describeContentError(error)
      if (field) {
        setErrors({ [field]: message })
        setFormError('Qırmızı ilə işarələnmiş xananı düzəldin.')
        requestAnimationFrame(() => formRef.current?.querySelector('[aria-invalid=true]')?.focus())
      } else {
        setFormError(message)
      }
      setSaving(false)
    }
  }

  const heading = config.itemTitle(value) || (created ? `Yeni ${config.noun}` : config.itemTitle(item))

  return (
    <>
      <Drawer open={open} onClose={requestClose} label={created ? `Yeni ${config.noun}` : `${config.noun} redaktəsi`} widthClass="max-w-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-linen-200 px-6 py-5">
          <div className="min-w-0">
            <p className={microLabelClass}>{created ? `Yeni ${config.noun}` : 'Redaktə'}</p>
            <h2 className="mt-1.5 truncate font-display text-2xl text-ink-900">{heading}</h2>
          </div>
          <DrawerCloseButton onClick={requestClose} />
        </header>

        <form
          ref={formRef}
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            save()
          }}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {formError && (
              <p role="alert" className="mb-6 flex animate-fade-in items-start gap-2 border border-clay-600/30 bg-clay-50 px-4 py-3 text-xs leading-relaxed text-clay-700">
                <AlertCircle size={14} strokeWidth={1.75} className="mt-0.5 shrink-0" />
                {formError}
              </p>
            )}
            {config.renderExtra?.({ value, onChange: change, context: config.context })}
            <SchemaForm fields={config.fields} value={value} onChange={change} errors={errors} context={config.context} />
          </div>

          <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-linen-200 bg-linen-100/40 px-6 py-4">
            <Button onClick={requestClose} disabled={saving}>
              Ləğv et
            </Button>
            <Button type="submit" variant="primary" disabled={saving || (!created && !dirty)}>
              {saving ? 'Saxlanılır…' : created ? 'Yarat' : 'Yadda saxla'}
            </Button>
          </footer>
        </form>
      </Drawer>

      <ConfirmDialog
        open={confirmDiscard}
        title="Dəyişikliklər itəcək"
        tone="default"
        confirmLabel="Bağla"
        cancelLabel="Redaktəyə qayıt"
        onCancel={() => setConfirmDiscard(false)}
        onConfirm={() => {
          setConfirmDiscard(false)
          onClose()
        }}
      >
        Yadda saxlanmamış dəyişikliklər var. Bağlasanız, onlar itəcək.
      </ConfirmDialog>
    </>
  )
}
