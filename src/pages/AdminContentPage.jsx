import { AlertCircle, ExternalLink, RefreshCw, RotateCcw } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAdminToast } from '../components/admin/AdminToasts.jsx'
import { AdminPageHeader, Button, EmptyState, Select, StaleNotice, microLabelClass } from '../components/admin/adminUi.jsx'
import { describeContentError } from '../components/admin/content/contentErrors.js'
import { SchemaForm } from '../components/admin/content/SchemaForm.jsx'
import { SECTIONS, SECTION_GROUPS } from '../components/admin/content/sectionSchemas.js'
import { useProductOptions } from '../components/admin/content/useProductOptions.js'
import { ListSkeleton } from '../components/admin/reviews/ReviewsList.jsx'
import { formatDateTime, formatTime, useAdminList } from '../components/admin/useAdminList.js'
import { getContentSections, saveContentSection } from '../services/adminService.js'
import { ApiError } from '../services/api.js'

const DEFAULT_KEY = 'hero'

/**
 * /admin/mezmun — every editable text and image of the storefront pages (GET/PUT /api/admin/content/sections).
 * Each section is saved on its own; unsaved edits of other sections stay in memory while switching between them.
 * A save reaches the database at once and open storefront tabs reload it (liveUpdates.js).
 */
export function AdminContentPage() {
  const { toast } = useAdminToast()
  const sections = useAdminList(getContentSections)
  const products = useProductOptions()
  const [searchParams, setSearchParams] = useSearchParams()
  const requested = searchParams.get('bolme')
  const activeKey = SECTIONS[requested] ? requested : DEFAULT_KEY
  const [drafts, setDrafts] = useState({})
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)
  const formRef = useRef(null)

  const stored = useMemo(() => Object.fromEntries(sections.items.map((section) => [section.key, section])), [sections.items])
  const schema = SECTIONS[activeKey]
  const saved = stored[activeKey]
  const value = drafts[activeKey] ?? saved?.data
  const dirtyKeys = Object.keys(drafts).filter((key) => JSON.stringify(drafts[key]) !== JSON.stringify(stored[key]?.data))
  const dirty = dirtyKeys.includes(activeKey)

  // Unsaved edits survive switching sections, but not leaving the page.
  useEffect(() => {
    if (dirtyKeys.length === 0) return undefined
    const warn = (event) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirtyKeys.length])

  const select = (key) => {
    setErrors({})
    setFormError(null)
    setSearchParams({ bolme: key }, { replace: true })
  }

  const change = (next) => {
    setDrafts((current) => ({ ...current, [activeKey]: next }))
    if (formError) setFormError(null)
  }

  const discard = () => {
    setDrafts(({ [activeKey]: _discarded, ...rest }) => rest)
    setErrors({})
    setFormError(null)
  }

  const save = async () => {
    if (saving || !dirty) return
    setSaving(true)
    setErrors({})
    setFormError(null)
    try {
      const result = await saveContentSection(activeKey, value)
      sections.setItems((items) => items.map((section) => (section.key === activeKey ? result : section)))
      setDrafts(({ [activeKey]: _saved, ...rest }) => rest)
      toast({ message: `«${schema.title}» yadda saxlanıldı — saytda yeniləndi.` })
    } catch (error) {
      const { field, message } = describeContentError(error)
      if (field) {
        setErrors({ [field]: message })
        setFormError('Qırmızı ilə işarələnmiş xananı düzəldin.')
        requestAnimationFrame(() => formRef.current?.querySelector('[aria-invalid=true]')?.focus())
      } else {
        setFormError(message)
      }
    } finally {
      setSaving(false)
    }
  }

  const ready = sections.status === 'ready'

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        eyebrow="Məzmun"
        title="Səhifələr"
        description="Saytın bütün mətnləri və şəkilləri: ana səhifə bölmələri, statik səhifələr, əlaqə məlumatları. Yadda saxlanan dəyişiklik dərhal saytda görünür."
        actions={
          <>
            {sections.loadedAt && <span className="text-[11px] text-ink-400">Yeniləndi · {formatTime(sections.loadedAt)}</span>}
            <Button size="sm" onClick={sections.reload} disabled={sections.refreshing || sections.status === 'loading' || dirtyKeys.length > 0}>
              <RefreshCw size={13} strokeWidth={1.75} className={sections.refreshing ? 'animate-spin' : ''} />
              Yenilə
            </Button>
          </>
        }
      />

      {ready && sections.error && <StaleNotice />}
      {sections.status === 'loading' && <ListSkeleton />}
      {sections.status === 'error' && (
        <EmptyState
          icon={AlertCircle}
          title={sections.error instanceof ApiError && sections.error.status === 403 ? 'Admin icazəniz yoxdur' : 'Məzmun yüklənmədi'}
          text="Bir az sonra yenidən cəhd edin."
          action={<Button onClick={sections.reload}>Yenidən cəhd et</Button>}
        />
      )}

      {ready && (
        <div className="mt-8 grid gap-8 lg:grid-cols-[14rem_minmax(0,1fr)]">
          {/* Section list: a sidebar on desktop, a select on phones */}
          <nav aria-label="Bölmələr" className="hidden lg:block">
            {SECTION_GROUPS.map((group) => (
              <div key={group.label} className="mb-6">
                <p className={`${microLabelClass} mb-2 px-3`}>{group.label}</p>
                {group.keys.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => select(key)}
                    aria-current={key === activeKey ? 'page' : undefined}
                    className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors ${
                      key === activeKey ? 'bg-linen-100 text-ink-900' : 'text-ink-500 hover:bg-linen-100/60 hover:text-ink-900'
                    }`}
                  >
                    <span className="truncate">{SECTIONS[key].title}</span>
                    {dirtyKeys.includes(key) ? (
                      <span aria-label="Saxlanmamış dəyişiklik" className="h-1.5 w-1.5 shrink-0 rounded-full bg-clay-500" />
                    ) : (
                      !stored[key]?.updatedAt && <span className="shrink-0 text-[9px] uppercase tracking-[0.15em] text-clay-600">boş</span>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </nav>

          <label className="block lg:hidden">
            <span className={`${microLabelClass} mb-1.5 block`}>Bölmə</span>
            <Select value={activeKey} onChange={(event) => select(event.target.value)}>
              {SECTION_GROUPS.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.keys.map((key) => (
                    <option key={key} value={key}>
                      {SECTIONS[key].title}
                      {dirtyKeys.includes(key) ? ' •' : ''}
                    </option>
                  ))}
                </optgroup>
              ))}
            </Select>
          </label>

          <section key={activeKey} className="min-w-0 animate-fade-up border border-linen-200">
            <header className="flex flex-wrap items-start justify-between gap-4 border-b border-linen-200 px-6 py-5">
              <div className="min-w-0">
                <h2 className="font-display text-2xl text-ink-900">{schema.title}</h2>
                {schema.description && <p className="mt-1 max-w-xl text-sm text-ink-500">{schema.description}</p>}
                <p className="mt-2 text-[11px] text-ink-400">
                  {saved?.updatedAt
                    ? `Son dəyişiklik · ${formatDateTime(saved.updatedAt)}`
                    : 'Hələ saxlanmayıb — bu bölmə saytda göstərilmir.'}
                </p>
              </div>
              <a
                href={schema.preview}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.3em] text-ink-500 transition-colors hover:text-clay-600"
              >
                Saytda bax
                <ExternalLink size={12} strokeWidth={1.5} />
              </a>
            </header>

            <form
              ref={formRef}
              noValidate
              onSubmit={(event) => {
                event.preventDefault()
                save()
              }}
            >
              <div className="px-6 py-6">
                {formError && (
                  <p role="alert" className="mb-6 flex animate-fade-in items-start gap-2 border border-clay-600/30 bg-clay-50 px-4 py-3 text-xs leading-relaxed text-clay-700">
                    <AlertCircle size={14} strokeWidth={1.75} className="mt-0.5 shrink-0" />
                    {formError}
                  </p>
                )}
                <SchemaForm fields={schema.fields} value={value} onChange={change} errors={errors} context={{ products }} />
              </div>

              <footer className="sticky bottom-0 flex flex-wrap items-center justify-end gap-2 border-t border-linen-200 bg-linen-50/95 px-6 py-4 backdrop-blur-sm">
                {dirty && <span className="mr-auto text-[11px] text-clay-600">Saxlanmamış dəyişikliklər var</span>}
                <Button onClick={discard} disabled={!dirty || saving}>
                  <RotateCcw size={13} strokeWidth={1.75} />
                  Geri qaytar
                </Button>
                <Button type="submit" variant="primary" disabled={!dirty || saving}>
                  {saving ? 'Saxlanılır…' : 'Yadda saxla'}
                </Button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}
