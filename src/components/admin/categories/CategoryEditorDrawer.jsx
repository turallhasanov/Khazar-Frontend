import { AlertCircle } from 'lucide-react'
import { useRef, useState } from 'react'
import { createCategory, updateCategory } from '../../../services/adminService.js'
import { Button, ConfirmDialog, Drawer, DrawerCloseButton, FormField, TextInput, microLabelClass } from '../adminUi.jsx'
import { slugify } from '../products/productForm.js'
import {
  LIMITS,
  describeCategoryError,
  emptyFields,
  fieldsFromCategory,
  fieldsToRequest,
  validateFields,
} from './categoryForm.js'

/**
 * Create / edit a category in a slide-over. The slug follows the label until the admin edits it. Renaming the key
 * (name) is allowed: products reference the category by id, so they all follow it.
 */
export function CategoryEditorDrawer({ open, category, nextSortOrder, onClose, onSaved }) {
  const mode = category ? 'edit' : 'create'
  const formRef = useRef(null)
  const [initialFields] = useState(() => (category ? fieldsFromCategory(category) : emptyFields(nextSortOrder)))
  const [fields, setFields] = useState(initialFields)
  const [slugTouched, setSlugTouched] = useState(mode === 'edit')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [confirmDiscard, setConfirmDiscard] = useState(false)

  const dirty = JSON.stringify(fields) !== JSON.stringify(initialFields)

  const update = (key) => (event) => {
    const { value } = event.target
    setFields((current) => {
      const next = { ...current, [key]: value }
      if (key === 'label' && !slugTouched) next.slug = slugify(value)
      return next
    })
    setErrors((current) => ({ ...current, [key]: undefined, ...(key === 'label' && !slugTouched ? { slug: undefined } : {}) }))
  }

  const requestClose = () => {
    if (saving) return
    if (dirty) setConfirmDiscard(true)
    else onClose()
  }

  const focusFirstError = () =>
    requestAnimationFrame(() => formRef.current?.querySelector('[aria-invalid=true]')?.focus())

  const save = async () => {
    if (saving) return
    const fieldErrors = validateFields(fields)
    setErrors(fieldErrors)
    if (Object.keys(fieldErrors).length) {
      setFormError('Qırmızı ilə işarələnmiş xanaları düzəldin.')
      focusFirstError()
      return
    }

    setSaving(true)
    setFormError(null)
    try {
      const body = fieldsToRequest(fields)
      const saved = mode === 'create' ? await createCategory(body) : await updateCategory(category.id, body)
      onSaved(saved, mode)
    } catch (error) {
      const { field, message } = describeCategoryError(error)
      if (field) {
        setErrors((current) => ({ ...current, [field]: message }))
        setFormError('Qırmızı ilə işarələnmiş xananı düzəldin.')
        focusFirstError()
      } else {
        setFormError(message)
      }
      setSaving(false)
    }
  }

  return (
    <>
      <Drawer open={open} onClose={requestClose} label={mode === 'create' ? 'Yeni kateqoriya' : 'Kateqoriyanı redaktə et'} widthClass="max-w-lg">
        <header className="flex items-start justify-between gap-4 border-b border-linen-200 px-6 py-5">
          <div className="min-w-0">
            <p className={microLabelClass}>{mode === 'create' ? 'Yeni kateqoriya' : 'Kateqoriyanı redaktə et'}</p>
            <h2 className="mt-1.5 truncate font-display text-2xl text-ink-900">
              {fields.label.trim() || (mode === 'create' ? 'Adsız kateqoriya' : category.label)}
            </h2>
            {category && (
              <p className="mt-2 text-[11px] text-ink-400">
                {category.productCount} məhsul bu kateqoriyadadır — dəyişikliklər hamısına aid olur.
              </p>
            )}
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

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Görünən ad" required error={errors.label} hint="Mağazada tabda görünür." className="sm:col-span-2">
                {(props) => (
                  <TextInput {...props} value={fields.label} onChange={update('label')} maxLength={LIMITS.label} placeholder="Palto" />
                )}
              </FormField>
              <FormField
                label="Açar ad"
                required
                error={errors.name}
                hint="API-nin «category» dəyəri; məhsul filtrləri bununla işləyir."
                className="sm:col-span-2"
              >
                {(props) => (
                  <TextInput {...props} value={fields.name} onChange={update('name')} maxLength={LIMITS.name} placeholder="Coat" />
                )}
              </FormField>
              <FormField label="Slug (URL)" required error={errors.slug} hint={`/katalog?kateqoriya=${fields.slug || '…'}`}>
                {(props) => (
                  <TextInput
                    {...props}
                    value={fields.slug}
                    onChange={(event) => {
                      setSlugTouched(true)
                      update('slug')(event)
                    }}
                    maxLength={LIMITS.slug}
                    placeholder="palto"
                    className="font-mono text-[13px]"
                  />
                )}
              </FormField>
              <FormField label="Sıra" required error={errors.sortOrder} hint="Kiçik rəqəm tabda əvvəl gəlir.">
                {(props) => (
                  <TextInput
                    {...props}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={LIMITS.maxSortOrder}
                    step={10}
                    value={fields.sortOrder}
                    onChange={update('sortOrder')}
                    className="tabular-nums"
                  />
                )}
              </FormField>
            </div>
          </div>

          <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-linen-200 bg-linen-100/40 px-6 py-4">
            <Button onClick={requestClose} disabled={saving}>
              Ləğv et
            </Button>
            <Button type="submit" variant="primary" disabled={saving || (mode === 'edit' && !dirty)}>
              {saving ? 'Saxlanılır…' : mode === 'create' ? 'Yarat' : 'Yadda saxla'}
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
