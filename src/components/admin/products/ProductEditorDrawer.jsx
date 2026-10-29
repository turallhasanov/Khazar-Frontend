import { AlertCircle, Archive, ArchiveRestore, ImageOff, Lock, Plus, Trash2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { addVariant, createProduct, removeVariant, updateProduct, updateVariantStock } from '../../../services/adminService.js'
import { useAdminToast } from '../AdminToasts.jsx'
import {
  Button,
  ConfirmDialog,
  Drawer,
  DrawerCloseButton,
  FormField,
  Select,
  TextArea,
  TextInput,
  microLabelClass,
} from '../adminUi.jsx'
import { ProductStatusBadge } from './ProductStatusBadge.jsx'
import {
  LIMITS,
  describeProductError,
  emptyFields,
  emptyVariant,
  fieldsFromProduct,
  fieldsToRequest,
  slugify,
  validateFields,
  validateVariant,
  validateVariantRows,
  variantToRequest,
} from './productForm.js'

const sectionTitle = `${microLabelClass} text-ink-900`
const cellInput = 'h-9 px-2.5 text-[13px]'

function isHttpUrl(value) {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol)
  } catch {
    return false
  }
}

function CoverPreview({ url }) {
  const [failedUrl, setFailedUrl] = useState(null)
  const valid = isHttpUrl(url.trim())
  return (
    <div className="flex aspect-[4/5] w-28 shrink-0 items-center justify-center overflow-hidden border border-linen-200 bg-linen-100">
      {valid && failedUrl !== url ? (
        <img
          src={url.trim()}
          alt=""
          onError={() => setFailedUrl(url)}
          className="h-full w-full animate-fade-in object-cover"
        />
      ) : (
        <span className="flex flex-col items-center gap-1.5 px-2 text-center text-[10px] text-ink-400">
          <ImageOff size={18} strokeWidth={1.25} />
          {valid ? 'Şəkil yüklənmədi' : 'Önizləmə'}
        </span>
      )}
    </div>
  )
}

/**
 * Create / edit a product in a slide-over. Product fields are saved together with "Saxla"; in edit mode variants
 * are separate, immediate calls (VariantManager). Closing with unsaved changes asks first, and the browser warns
 * before leaving the page. Ctrl/⌘+S saves.
 */
export function ProductEditorDrawer({ open, product, categories, onClose, onSaved, onProductChange, onArchive, onRestore, onDelete }) {
  const mode = product ? 'edit' : 'create'
  const { toast } = useAdminToast()
  const panelRef = useRef(null)
  const [initialFields] = useState(() => (product ? fieldsFromProduct(product) : emptyFields))
  const [fields, setFields] = useState(initialFields)
  const [slugTouched, setSlugTouched] = useState(mode === 'edit')
  const [rows, setRows] = useState(() => (product ? [] : [emptyVariant()]))
  const [errors, setErrors] = useState({})
  const [rowErrors, setRowErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [variantsDirty, setVariantsDirty] = useState(false)
  const [confirmDiscard, setConfirmDiscard] = useState(false)

  const fieldsDirty = JSON.stringify(fields) !== JSON.stringify(initialFields)
  const rowsDirty = mode === 'create' && rows.some((row) => row.size || row.color || row.sku)
  const dirty = fieldsDirty || rowsDirty || variantsDirty

  const update = (key) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setFields((current) => {
      const next = { ...current, [key]: value }
      // The slug follows the name until the admin edits it.
      if (key === 'name' && !slugTouched) next.slug = slugify(value)
      return next
    })
    // Typing clears that field's error; the name also clears the slug's while the slug still follows it.
    setErrors((current) => ({ ...current, [key]: undefined, ...(key === 'name' && !slugTouched ? { slug: undefined } : {}) }))
  }

  const requestClose = () => {
    if (saving) return
    if (dirty) setConfirmDiscard(true)
    else onClose()
  }

  useEffect(() => {
    if (!open || !dirty) return undefined
    const onBeforeUnload = (event) => event.preventDefault()
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  })

  const focusFirstError = () =>
    requestAnimationFrame(() => panelRef.current?.querySelector('[aria-invalid=true]')?.focus())

  const save = async () => {
    if (saving) return
    const fieldErrors = validateFields(fields)
    const variantErrors = mode === 'create' ? validateVariantRows(rows) : {}
    setErrors(fieldErrors)
    setRowErrors(variantErrors)
    if (mode === 'create' && rows.length === 0) {
      setFormError('Ən azı bir variant əlavə edin.')
      return
    }
    if (Object.keys(fieldErrors).length || Object.keys(variantErrors).length) {
      setFormError('Qırmızı ilə işarələnmiş xanaları düzəldin.')
      focusFirstError()
      return
    }

    setSaving(true)
    setFormError(null)
    try {
      const body = fieldsToRequest(fields)
      const saved =
        mode === 'create'
          ? await createProduct({ ...body, variants: rows.map(variantToRequest) })
          : await updateProduct(product.id, body)
      onSaved(saved, mode)
    } catch (error) {
      const { field, message } = describeProductError(error)
      if (field && field !== 'variant') {
        setErrors((current) => ({ ...current, [field]: message }))
        setFormError('Qırmızı ilə işarələnmiş xananı düzəldin.')
        focusFirstError()
      } else {
        setFormError(message)
      }
      setSaving(false)
    }
  }

  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        save()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  })

  const updateRow = (key, field, value) => {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, [field]: value } : row)))
    if (rowErrors[key]?.[field]) setRowErrors((current) => ({ ...current, [key]: { ...current[key], [field]: undefined } }))
  }

  return (
    <>
      <Drawer open={open} onClose={requestClose} label={mode === 'create' ? 'Yeni məhsul' : 'Məhsulu redaktə et'} widthClass="max-w-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-linen-200 px-6 py-5">
          <div className="min-w-0">
            <p className={microLabelClass}>{mode === 'create' ? 'Yeni məhsul' : 'Məhsulu redaktə et'}</p>
            <h2 className="mt-1.5 truncate font-display text-2xl text-ink-900">
              {fields.name.trim() || (mode === 'create' ? 'Adsız məhsul' : product.name)}
            </h2>
            {product && (
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-ink-400">
                <ProductStatusBadge product={product} />
                <span>{product.reviewCount} rəy</span>
                <span aria-hidden="true">·</span>
                <span>{product.hasOrders ? 'Sifarişlərdə var' : 'Hələ sifariş olunmayıb'}</span>
              </div>
            )}
          </div>
          <DrawerCloseButton onClick={requestClose} />
        </header>

        <form
          ref={panelRef}
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

            <section aria-labelledby="product-basics">
              <h3 id="product-basics" className={sectionTitle}>Əsas məlumat</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <FormField label="Ad" required error={errors.name} className="sm:col-span-2">
                  {(props) => (
                    <TextInput {...props} value={fields.name} onChange={update('name')} maxLength={LIMITS.name} placeholder="Heavyweight Hoodie" />
                  )}
                </FormField>
                <FormField
                  label="Slug (URL)"
                  required
                  error={errors.slug}
                  hint={`/mehsul/${fields.slug || '…'}`}
                  className="sm:col-span-2"
                >
                  {(props) => (
                    <TextInput
                      {...props}
                      value={fields.slug}
                      onChange={(event) => {
                        setSlugTouched(true)
                        update('slug')(event)
                      }}
                      maxLength={LIMITS.slug}
                      placeholder="heavyweight-hoodie"
                      className="font-mono text-[13px]"
                    />
                  )}
                </FormField>
                <FormField
                  label="Kateqoriya"
                  required
                  error={errors.categoryId}
                  hint={categories.length === 0 ? 'Əvvəlcə «Kateqoriyalar» bölməsində kateqoriya yaradın.' : undefined}
                >
                  {(props) => (
                    <Select {...props} value={fields.categoryId} onChange={update('categoryId')} disabled={categories.length === 0}>
                      <option value="">Seçin…</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.label}
                          {category.label !== category.name ? ` (${category.name})` : ''}
                        </option>
                      ))}
                    </Select>
                  )}
                </FormField>
                <FormField label="Parça tərkibi" required error={errors.fabric}>
                  {(props) => (
                    <TextInput {...props} value={fields.fabric} onChange={update('fabric')} maxLength={LIMITS.fabric} placeholder="%85 Pambıq, %15 Polyester" />
                  )}
                </FormField>
                <FormField
                  label="Təsvir"
                  error={errors.description}
                  counter={`${fields.description.length}/${LIMITS.description}`}
                  className="sm:col-span-2"
                >
                  {(props) => (
                    <TextArea {...props} rows={4} value={fields.description} onChange={update('description')} maxLength={LIMITS.description} />
                  )}
                </FormField>
              </div>
            </section>

            <section aria-labelledby="product-sale" className="mt-8 border-t border-linen-200 pt-6">
              <h3 id="product-sale" className={sectionTitle}>Satış və görünüş</h3>
              <div className="mt-4 flex flex-col gap-5 sm:flex-row">
                <CoverPreview url={fields.coverImage} />
                <div className="grid min-w-0 flex-1 gap-4">
                  <FormField label="Şəkil ünvanı" required error={errors.coverImage}>
                    {(props) => (
                      <TextInput {...props} type="url" value={fields.coverImage} onChange={update('coverImage')} maxLength={LIMITS.coverImage} placeholder="https://images.unsplash.com/…" />
                    )}
                  </FormField>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField label="Qiymət (₼)" required error={errors.price}>
                      {(props) => (
                        <TextInput {...props} inputMode="decimal" value={fields.price} onChange={update('price')} placeholder="89,90" className="tabular-nums" />
                      )}
                    </FormField>
                    <label className="flex cursor-pointer items-center gap-3 self-end border border-ink-900/15 px-3 py-2.5 transition-colors hover:border-ink-900/30">
                      <input
                        type="checkbox"
                        checked={fields.isFeatured}
                        onChange={update('isFeatured')}
                        className="h-4 w-4 accent-ink-900"
                      />
                      <span className="text-sm text-ink-700">Önə çıxan (bestseller)</span>
                    </label>
                  </div>
                </div>
              </div>
            </section>

            <section aria-labelledby="product-variants" className="mt-8 border-t border-linen-200 pt-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 id="product-variants" className={sectionTitle}>Variantlar və stok</h3>
                <p className="flex items-center gap-1.5 text-[11px] text-ink-400">
                  <Lock size={11} strokeWidth={1.75} />
                  SKU NexusERP ilə eşləşmə açarıdır — sonradan dəyişdirilmir.
                </p>
              </div>

              {mode === 'create' ? (
                <NewVariantRows rows={rows} errors={rowErrors} onChange={updateRow} onAdd={() => setRows((current) => [...current, emptyVariant()])} onRemove={(key) => setRows((current) => current.filter((row) => row.key !== key))} />
              ) : (
                <VariantManager product={product} onProductChange={onProductChange} onDirtyChange={setVariantsDirty} toast={toast} />
              )}
            </section>
          </div>

          <footer className="flex flex-wrap items-center gap-2 border-t border-linen-200 bg-linen-100/40 px-6 py-4">
            {product && (
              <div className="mr-auto flex gap-2">
                {product.isActive ? (
                  <Button size="sm" variant="ghost" onClick={() => onArchive(product)} disabled={saving}>
                    <Archive size={13} strokeWidth={1.75} />
                    Arxivlə
                  </Button>
                ) : (
                  <Button size="sm" variant="ghost" onClick={() => onRestore(product)} disabled={saving}>
                    <ArchiveRestore size={13} strokeWidth={1.75} />
                    Bərpa et
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => onDelete(product)} disabled={saving} className="text-clay-600 hover:text-clay-700">
                  <Trash2 size={13} strokeWidth={1.75} />
                  Sil
                </Button>
              </div>
            )}
            <div className="ml-auto flex gap-2">
              <Button onClick={requestClose} disabled={saving}>Ləğv et</Button>
              <Button type="submit" variant="primary" disabled={saving || (mode === 'edit' && !fieldsDirty)} title="Ctrl/⌘ + S">
                {saving ? 'Saxlanılır…' : mode === 'create' ? 'Məhsulu yarat' : 'Dəyişiklikləri saxla'}
              </Button>
            </div>
          </footer>
        </form>
      </Drawer>

      <ConfirmDialog
        open={confirmDiscard}
        title="Saxlanmamış dəyişikliklər var"
        confirmLabel="Dəyişiklikləri at"
        cancelLabel="Redaktəyə qayıt"
        onCancel={() => setConfirmDiscard(false)}
        onConfirm={() => {
          setConfirmDiscard(false)
          onClose()
        }}
      >
        Bağlasanız, bu formada etdiyiniz dəyişikliklər itəcək.
      </ConfirmDialog>
    </>
  )
}

function VariantColumnsHeader() {
  return (
    <div className="hidden grid-cols-[4.5rem_minmax(0,1fr)_minmax(0,1.3fr)_5.5rem_2.5rem] gap-2 pb-1.5 sm:grid">
      {['Ölçü', 'Rəng', 'SKU', 'Stok'].map((label) => (
        <span key={label} className={microLabelClass}>{label}</span>
      ))}
    </div>
  )
}

const rowGrid = 'grid grid-cols-2 gap-2 sm:grid-cols-[4.5rem_minmax(0,1fr)_minmax(0,1.3fr)_5.5rem_2.5rem] sm:items-start'

function CellInput({ error, label, ...props }) {
  return (
    <span className="block">
      <TextInput aria-label={label} aria-invalid={error ? true : undefined} className={cellInput} {...props} />
      {error && <span className="mt-1 block animate-fade-in text-[10px] text-clay-600">{error}</span>}
    </span>
  )
}

/** Create mode: variant rows that are sent together with the product. */
function NewVariantRows({ rows, errors, onChange, onAdd, onRemove }) {
  return (
    <div className="mt-4">
      <VariantColumnsHeader />
      <ul className="space-y-3 sm:space-y-2">
        {rows.map((row) => {
          const rowError = errors[row.key] ?? {}
          return (
            <li key={row.key} className={`${rowGrid} animate-fade-up border-b border-linen-200 pb-3 sm:border-0 sm:pb-0`}>
              <CellInput label="Ölçü" error={rowError.size} value={row.size} onChange={(e) => onChange(row.key, 'size', e.target.value)} placeholder="M" maxLength={LIMITS.size} />
              <CellInput label="Rəng" error={rowError.color} value={row.color} onChange={(e) => onChange(row.key, 'color', e.target.value)} placeholder="Qara" maxLength={LIMITS.color} />
              <CellInput label="SKU" error={rowError.sku} value={row.sku} onChange={(e) => onChange(row.key, 'sku', e.target.value.toUpperCase())} placeholder="KHZ-HVHD-BLK-M" maxLength={LIMITS.sku} className={`${cellInput} font-mono`} />
              <CellInput label="Stok" error={rowError.stockQuantity} value={row.stockQuantity} onChange={(e) => onChange(row.key, 'stockQuantity', e.target.value)} inputMode="numeric" className={`${cellInput} tabular-nums`} />
              <Button size="icon" variant="ghost" aria-label="Variantı sil" title="Variantı sil" disabled={rows.length === 1} onClick={() => onRemove(row.key)} className="justify-self-end">
                <X size={15} strokeWidth={1.5} />
              </Button>
            </li>
          )
        })}
      </ul>
      <Button size="sm" onClick={onAdd} className="mt-3">
        <Plus size={13} strokeWidth={1.75} />
        Variant əlavə et
      </Button>
    </div>
  )
}

/**
 * Edit mode: each variant's stock is saved on its own ("Saxla" appears once changed); variants are added and removed
 * immediately. Ordered variants and the last variant cannot be removed — the button says why instead of failing.
 */
function VariantManager({ product, onProductChange, onDirtyChange, toast }) {
  const [drafts, setDrafts] = useState({})
  const [busy, setBusy] = useState(null)
  const [rowError, setRowError] = useState({})
  const [newRow, setNewRow] = useState(emptyVariant)
  const [newErrors, setNewErrors] = useState({})
  const [confirmRemove, setConfirmRemove] = useState(null)

  const isDirty = (variant) => drafts[variant.id] !== undefined && drafts[variant.id] !== String(variant.stockQuantity)
  const anyDirty = product.variants.some(isDirty) || Boolean(newRow.size || newRow.color || newRow.sku)

  useEffect(() => onDirtyChange(anyDirty), [anyDirty, onDirtyChange])

  const run = async (key, action, success) => {
    setBusy(key)
    try {
      const updated = await action()
      onProductChange(updated)
      toast({ message: success })
      return true
    } catch (error) {
      toast({ message: describeProductError(error).message, tone: 'error' })
      return false
    } finally {
      setBusy(null)
    }
  }

  const saveStock = async (variant) => {
    const text = drafts[variant.id]
    const quantity = Number(text)
    if (text === '' || !Number.isInteger(quantity) || quantity < 0 || quantity > LIMITS.maxStock) {
      setRowError((current) => ({ ...current, [variant.id]: `0–${LIMITS.maxStock} arası tam ədəd` }))
      return
    }
    const ok = await run(variant.id, () => updateVariantStock(product.id, variant.id, quantity), `${variant.color} / ${variant.size} stoku: ${quantity}`)
    if (ok) {
      setDrafts((current) => {
        const next = { ...current }
        delete next[variant.id]
        return next
      })
    }
  }

  const add = async () => {
    const takenSkus = new Set(product.variants.map((variant) => variant.sku.toUpperCase()))
    const takenPairs = new Set(product.variants.map((variant) => `${variant.color.toUpperCase()}|${variant.size.toUpperCase()}`))
    const errors = validateVariant(newRow, { takenSkus, takenPairs })
    setNewErrors(errors)
    if (Object.keys(errors).length) return
    const request = variantToRequest(newRow)
    const ok = await run('new', () => addVariant(product.id, request), `${request.color} / ${request.size} variantı əlavə olundu`)
    if (ok) setNewRow(emptyVariant())
  }

  const removeHint = (variant) => {
    if (variant.hasOrders) return 'Sifarişlərdə var — silmək olmaz; stoku 0 edin'
    if (product.variants.length === 1) return 'Son variant silinə bilməz'
    return null
  }

  return (
    <div className="mt-4">
      <VariantColumnsHeader />
      <ul className="space-y-3 sm:space-y-2">
        {product.variants.map((variant) => {
          const hint = removeHint(variant)
          const dirty = isDirty(variant)
          return (
            <li key={variant.id} className={`${rowGrid} border-b border-linen-200 pb-3 sm:border-0 sm:pb-0`}>
              <span className="flex h-9 items-center border border-transparent px-1 text-[13px] text-ink-900">{variant.size}</span>
              <span className="flex h-9 items-center truncate px-1 text-[13px] text-ink-900">{variant.color}</span>
              <span className="flex h-9 items-center gap-1.5 truncate px-1 font-mono text-[12px] text-ink-500" title="NexusERP ilə eşləşmə açarı">
                <Lock size={11} strokeWidth={1.75} className="shrink-0 text-ink-400" />
                {variant.sku}
              </span>
              <span className="flex items-start gap-1">
                <CellInput
                  label={`${variant.color} / ${variant.size} stoku`}
                  error={rowError[variant.id]}
                  value={drafts[variant.id] ?? String(variant.stockQuantity)}
                  onChange={(e) => {
                    setDrafts((current) => ({ ...current, [variant.id]: e.target.value }))
                    setRowError((current) => ({ ...current, [variant.id]: undefined }))
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      if (dirty) saveStock(variant)
                    }
                  }}
                  inputMode="numeric"
                  className={`${cellInput} tabular-nums ${variant.stockQuantity <= 5 && !dirty ? 'text-clay-600' : ''}`}
                />
              </span>
              <span className="flex justify-end">
                {dirty ? (
                  <Button size="sm" variant="primary" disabled={busy === variant.id} onClick={() => saveStock(variant)} className="animate-fade-in px-2">
                    {busy === variant.id ? '…' : 'Saxla'}
                  </Button>
                ) : (
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={hint ? `Silmək olmaz: ${hint}` : `${variant.color} / ${variant.size} variantını sil`}
                    title={hint ?? 'Variantı sil'}
                    disabled={Boolean(hint) || busy === variant.id}
                    onClick={() => setConfirmRemove(variant)}
                    className="hover:text-clay-600"
                  >
                    <Trash2 size={14} strokeWidth={1.5} />
                  </Button>
                )}
              </span>
            </li>
          )
        })}

        <li className={`${rowGrid} border-t border-dashed border-ink-900/15 pt-3`}>
          <CellInput label="Yeni variant ölçüsü" error={newErrors.size} value={newRow.size} onChange={(e) => setNewRow((c) => ({ ...c, size: e.target.value }))} placeholder="Ölçü" maxLength={LIMITS.size} />
          <CellInput label="Yeni variant rəngi" error={newErrors.color} value={newRow.color} onChange={(e) => setNewRow((c) => ({ ...c, color: e.target.value }))} placeholder="Rəng" maxLength={LIMITS.color} />
          <CellInput label="Yeni variant SKU" error={newErrors.sku} value={newRow.sku} onChange={(e) => setNewRow((c) => ({ ...c, sku: e.target.value.toUpperCase() }))} placeholder="SKU" maxLength={LIMITS.sku} className={`${cellInput} font-mono`} />
          <CellInput label="Yeni variant stoku" error={newErrors.stockQuantity} value={newRow.stockQuantity} onChange={(e) => setNewRow((c) => ({ ...c, stockQuantity: e.target.value }))} inputMode="numeric" className={`${cellInput} tabular-nums`} />
          <span className="flex justify-end">
            <Button size="icon" variant="secondary" aria-label="Variantı əlavə et" title="Variantı əlavə et" disabled={busy === 'new'} onClick={add}>
              <Plus size={15} strokeWidth={1.75} />
            </Button>
          </span>
        </li>
      </ul>
      <p className="mt-3 text-[11px] text-ink-400">Variant dəyişiklikləri dərhal saxlanılır.</p>

      <ConfirmDialog
        open={Boolean(confirmRemove)}
        title="Variant silinsin?"
        confirmLabel="Variantı sil"
        busy={busy === confirmRemove?.id}
        onCancel={() => setConfirmRemove(null)}
        onConfirm={async () => {
          const variant = confirmRemove
          await run(variant.id, () => removeVariant(product.id, variant.id), `${variant.color} / ${variant.size} variantı silindi`)
          setConfirmRemove(null)
        }}
      >
        <strong className="font-medium text-ink-900">
          {confirmRemove?.color} / {confirmRemove?.size}
        </strong>{' '}
        ({confirmRemove?.sku}) variantı və onun {confirmRemove?.stockQuantity} ədəd stoku silinəcək. Bu əməliyyat geri
        qaytarıla bilməz.
      </ConfirmDialog>
    </div>
  )
}
