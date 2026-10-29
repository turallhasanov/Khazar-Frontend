import { AlertCircle, PackageOpen, Plus, RefreshCw, Search, SearchX, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAdminToast } from '../components/admin/AdminToasts.jsx'
import {
  AdminPageHeader,
  Button,
  ConfirmDialog,
  FilterField,
  Select,
  StatStrip,
  TextInput,
} from '../components/admin/adminUi.jsx'
import { ProductEditorDrawer } from '../components/admin/products/ProductEditorDrawer.jsx'
import { ProductsList } from '../components/admin/products/ProductsList.jsx'
import { describeProductError } from '../components/admin/products/productForm.js'
import { ListSkeleton, Pagination } from '../components/admin/reviews/ReviewsList.jsx'
import {
  archiveProduct,
  deleteProduct,
  getAdminCategories,
  getAdminProducts,
  restoreProduct,
} from '../services/adminService.js'
import { ApiError } from '../services/api.js'

const PAGE_SIZE = 10
const LEAVE_MS = 240
const FLASH_MS = 1400

const DEFAULTS = { view: 'all', q: '', category: '', sort: 'name', page: '1' }

const SORTS = {
  name: { label: 'Ad (A–Z)', compare: (a, b) => a.name.localeCompare(b.name, 'az') },
  newest: { label: 'Ən yeni', compare: (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt) },
  updated: {
    label: 'Son yenilənən',
    compare: (a, b) => Date.parse(b.updatedAt ?? b.createdAt) - Date.parse(a.updatedAt ?? a.createdAt),
  },
  'price-asc': { label: 'Qiymət: artan', compare: (a, b) => a.price - b.price },
  'price-desc': { label: 'Qiymət: azalan', compare: (a, b) => b.price - a.price },
  'stock-asc': { label: 'Stok: az olan əvvəl', compare: (a, b) => a.totalStock - b.totalStock },
}

const VIEWS = {
  all: () => true,
  active: (product) => product.isActive,
  archived: (product) => !product.isActive,
  out: (product) => product.isActive && product.totalStock === 0,
}

const norm = (value) => value.toLocaleLowerCase('az')

const formatTime = (date) => `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`

function matchesQuery(product, query) {
  if (!query) return true
  const haystack = norm(
    `${product.name} ${product.slug} ${product.category} ${product.categoryLabel ?? ''} ${product.fabric} ${product.variants.map((v) => v.sku).join(' ')}`,
  )
  return haystack.includes(norm(query.trim()))
}

/**
 * /admin/mehsullar — catalog management against /api/admin/products: create, edit (fields + variants and stock),
 * archive / restore with undo, and delete with confirmation. Products that were ordered cannot be deleted; the
 * dialog offers archiving instead. Filters live in the URL query.
 */
export function AdminProductsPage() {
  const { toast } = useAdminToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const [state, setState] = useState({ status: 'loading', products: [], error: null, loadedAt: null, refreshing: false })
  // Categories feed the filter and the editor's dropdown; a failed load only empties them, the list still works.
  const [categories, setCategories] = useState([])
  const [reloadKey, setReloadKey] = useState(0)
  const [editor, setEditor] = useState({ open: false, productId: null, snapshot: null, key: 0 })
  const [confirm, setConfirm] = useState(null)
  const [confirmBusy, setConfirmBusy] = useState(false)
  const [busyIds, setBusyIds] = useState(() => new Set())
  const [leavingIds, setLeavingIds] = useState(() => new Set())
  const [flashId, setFlashId] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    getAdminCategories({ signal: controller.signal })
      .then(setCategories)
      .catch((error) => {
        if (error.name !== 'AbortError') setCategories([])
      })
    getAdminProducts({ signal: controller.signal })
      .then((products) => setState({ status: 'ready', products, error: null, loadedAt: new Date(), refreshing: false }))
      .catch((error) => {
        if (error.name === 'AbortError') return
        setState((current) => ({ ...current, status: current.loadedAt ? 'ready' : 'error', error, refreshing: false }))
      })
    return () => controller.abort()
  }, [reloadKey])

  const reload = () => {
    setState((current) => ({ ...current, refreshing: true, error: null }))
    setReloadKey((current) => current + 1)
  }

  const filters = Object.fromEntries(Object.entries(DEFAULTS).map(([key, value]) => [key, searchParams.get(key) ?? value]))
  const setParams = useCallback(
    (patch) =>
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          for (const [key, value] of Object.entries(patch)) {
            if (!value || value === DEFAULTS[key]) next.delete(key)
            else next.set(key, value)
          }
          return next
        },
        { replace: true },
      ),
    [setSearchParams],
  )
  const changeFilter = (key, value) => setParams({ [key]: value, page: key === 'page' ? value : '1' })
  const refined = Boolean(filters.q || filters.category)

  const { products } = state
  const searched = products.filter(
    (product) => matchesQuery(product, filters.q) && (!filters.category || product.category === filters.category),
  )
  const counts = Object.fromEntries(Object.entries(VIEWS).map(([key, test]) => [key, searched.filter(test).length]))
  const shown = searched.filter(VIEWS[filters.view] ?? VIEWS.all).sort((SORTS[filters.sort] ?? SORTS.name).compare)
  const pageCount = Math.max(1, Math.ceil(shown.length / PAGE_SIZE))
  const page = Math.min(Math.max(Number(filters.page) || 1, 1), pageCount)
  const pageItems = shown.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // ---------- list updates with motion ----------
  const replaceProduct = useCallback((updated) => {
    setState((current) => ({
      ...current,
      products: current.products.map((product) => (product.id === updated.id ? updated : product)),
    }))
  }, [])

  const flash = (id) => {
    setFlashId(id)
    setTimeout(() => setFlashId((current) => (current === id ? null : current)), FLASH_MS)
  }

  // A product that no longer fits the current view slides out before the list changes.
  const applyChange = (updated, { remove = false } = {}) => {
    const leaves = remove || !(VIEWS[filters.view] ?? VIEWS.all)(updated)
    if (!leaves) {
      replaceProduct(updated)
      flash(updated.id)
      return
    }
    setLeavingIds((current) => new Set(current).add(updated.id))
    setTimeout(() => {
      setState((current) => ({
        ...current,
        products: remove
          ? current.products.filter((product) => product.id !== updated.id)
          : current.products.map((product) => (product.id === updated.id ? updated : product)),
      }))
      setLeavingIds((current) => {
        const next = new Set(current)
        next.delete(updated.id)
        return next
      })
    }, LEAVE_MS)
  }

  const withBusy = async (id, action) => {
    setBusyIds((current) => new Set(current).add(id))
    try {
      return await action()
    } finally {
      setBusyIds((current) => {
        const next = new Set(current)
        next.delete(id)
        return next
      })
    }
  }

  // ---------- actions ----------
  const openCreate = () => setEditor((current) => ({ open: true, productId: null, snapshot: null, key: current.key + 1 }))
  const openEdit = (product) =>
    setEditor((current) => ({ open: true, productId: product.id, snapshot: product, key: current.key + 1 }))
  const closeEditor = () => setEditor((current) => ({ ...current, open: false }))

  const editorProduct = editor.productId
    ? (products.find((product) => product.id === editor.productId) ?? editor.snapshot)
    : null

  const onSaved = (saved, mode) => {
    closeEditor()
    if (mode === 'create') {
      setState((current) => ({ ...current, products: [saved, ...current.products] }))
      flash(saved.id)
      toast({ message: `«${saved.name}» yaradıldı.` })
    } else {
      applyChange(saved)
      toast({ message: `«${saved.name}» yadda saxlanıldı.` })
    }
  }

  const archive = async (product, { undo = false } = {}) => {
    try {
      const updated = await withBusy(product.id, () => archiveProduct(product.id))
      applyChange(updated)
      toast({
        message: undo ? 'Bərpa geri alındı.' : `«${product.name}» arxivləndi — mağazada görünmür.`,
        tone: undo ? 'info' : 'success',
        action: undo ? null : { label: 'Geri al', onClick: () => restore(updated, { undo: true }) },
      })
    } catch (error) {
      toast({ message: describeProductError(error).message, tone: 'error' })
    }
  }

  const restore = async (product, { undo = false } = {}) => {
    try {
      const updated = await withBusy(product.id, () => restoreProduct(product.id))
      applyChange(updated)
      toast({
        message: undo ? 'Arxivləmə geri alındı.' : `«${product.name}» bərpa olundu — yenidən mağazada.`,
        tone: undo ? 'info' : 'success',
        action: undo ? null : { label: 'Geri al', onClick: () => archive(updated, { undo: true }) },
      })
    } catch (error) {
      toast({ message: describeProductError(error).message, tone: 'error' })
    }
  }

  const confirmDelete = async () => {
    const product = confirm.product
    setConfirmBusy(true)
    try {
      if (product.hasOrders) {
        setConfirm(null)
        await archive(product)
        return
      }
      await withBusy(product.id, () => deleteProduct(product.id))
      setConfirm(null)
      if (editor.productId === product.id) closeEditor()
      applyChange(product, { remove: true })
      toast({ message: `«${product.name}» silindi.` })
    } catch (error) {
      setConfirm(null)
      toast({ message: describeProductError(error).message, tone: 'error' })
      // e.g. the product was ordered since the list was loaded.
      if (error instanceof ApiError && error.status === 409) reload()
    } finally {
      setConfirmBusy(false)
    }
  }

  const listActions = {
    onEdit: openEdit,
    onArchive: (product) => archive(product),
    onRestore: (product) => restore(product),
    onDelete: (product) => setConfirm({ product }),
  }

  const ready = state.status === 'ready'
  const deleting = confirm?.product

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        eyebrow="Kataloq"
        title="Məhsullar"
        description="Mağazada satılan məhsullar, variantları və stoku. Arxivlənmiş məhsul mağazadan gizlənir, amma sifariş tarixçəsi qalır."
        actions={
          <>
            {state.loadedAt && <span className="text-[11px] text-ink-400">Yeniləndi · {formatTime(state.loadedAt)}</span>}
            <Button size="sm" onClick={reload} disabled={state.refreshing || state.status === 'loading'} aria-label="Siyahını yenilə">
              <RefreshCw size={13} strokeWidth={1.75} className={state.refreshing ? 'animate-spin' : ''} />
              Yenilə
            </Button>
            <Button variant="primary" onClick={openCreate} disabled={!ready}>
              <Plus size={15} strokeWidth={1.75} />
              Yeni məhsul
            </Button>
          </>
        }
      />

      {ready && state.error && (
        <p role="alert" className="mt-6 flex items-center gap-2 border border-clay-600/30 bg-clay-50 px-4 py-3 text-xs text-clay-700">
          <AlertCircle size={14} strokeWidth={1.75} />
          Siyahı yenilənmədi; ekranda son yüklənmiş məlumatlar göstərilir.
        </p>
      )}

      {state.status === 'loading' && <ListSkeleton />}

      {state.status === 'error' && (
        <EmptyState
          icon={AlertCircle}
          title={state.error instanceof ApiError && state.error.status === 403 ? 'Admin icazəniz yoxdur' : 'Məhsullar yüklənmədi'}
          text={state.error instanceof ApiError && state.error.status === 0 ? 'Serverə qoşulmaq mümkün olmadı.' : 'Bir az sonra yenidən cəhd edin.'}
          action={<Button onClick={reload}>Yenidən cəhd et</Button>}
        />
      )}

      {ready && products.length === 0 && (
        <EmptyState
          icon={PackageOpen}
          title="Kataloq boşdur"
          text="İlk məhsulu əlavə edin; o, yaradılan kimi mağazada görünəcək."
          action={
            <Button variant="primary" onClick={openCreate}>
              <Plus size={15} strokeWidth={1.75} />
              Yeni məhsul
            </Button>
          }
        />
      )}

      {ready && products.length > 0 && (
        <>
          <div className="mt-8">
            <StatStrip
              label="Məhsul görünüşü"
              value={filters.view}
              onChange={(value) => changeFilter('view', value)}
              cells={[
                { value: 'all', label: 'Hamısı', count: counts.all, hint: 'kataloqda', accent: 'ink' },
                { value: 'active', label: 'Aktiv', count: counts.active, hint: 'mağazada görünür', accent: 'sage' },
                { value: 'out', label: 'Stokda yoxdur', count: counts.out, hint: 'aktiv, amma satıla bilmir', accent: 'clay' },
                { value: 'archived', label: 'Arxivdə', count: counts.archived, hint: 'mağazadan gizlədilib', accent: 'muted' },
              ]}
            />
          </div>

          <section aria-label="Axtarış və filtrlər" className="mt-6 border border-linen-200 bg-linen-100/40 p-4 sm:p-5">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,2fr)_repeat(2,minmax(0,1fr))_auto]">
              <FilterField label="Axtarış" className="md:col-span-2 xl:col-span-1">
                <span className="relative block">
                  <Search size={15} strokeWidth={1.5} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                  <TextInput
                    type="search"
                    value={filters.q}
                    onChange={(event) => changeFilter('q', event.target.value)}
                    placeholder="Ad, slug, kateqoriya və ya SKU…"
                    className="pl-9 pr-9 [&::-webkit-search-cancel-button]:hidden"
                  />
                  {filters.q && (
                    <button type="button" aria-label="Axtarışı təmizlə" onClick={() => changeFilter('q', '')} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-ink-400 transition-colors hover:text-ink-900">
                      <X size={14} strokeWidth={1.5} />
                    </button>
                  )}
                </span>
              </FilterField>
              <FilterField label="Kateqoriya">
                <Select value={filters.category} onChange={(event) => changeFilter('category', event.target.value)}>
                  <option value="">Bütün kateqoriyalar</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>{category.label}</option>
                  ))}
                </Select>
              </FilterField>
              <FilterField label="Sıralama">
                <Select value={filters.sort} onChange={(event) => changeFilter('sort', event.target.value)}>
                  {Object.entries(SORTS).map(([value, sort]) => (
                    <option key={value} value={value}>{sort.label}</option>
                  ))}
                </Select>
              </FilterField>
              <div className="flex items-end justify-between gap-3 md:col-span-2 xl:col-span-1 xl:justify-end">
                <p className="pb-3 text-[11px] tabular-nums text-ink-500" aria-live="polite">{shown.length} nəticə</p>
                {refined && (
                  <Button size="sm" variant="ghost" onClick={() => setParams({ q: '', category: '', page: '1' })} className="mb-1 animate-fade-in">
                    <X size={13} strokeWidth={1.5} />
                    Təmizlə
                  </Button>
                )}
              </div>
            </div>
          </section>

          {shown.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="Uyğun məhsul tapılmadı"
              text={refined ? 'Axtarışı dəyişin və ya filtrləri təmizləyin.' : 'Bu görünüşdə məhsul yoxdur.'}
              action={
                refined ? (
                  <Button onClick={() => setParams({ q: '', category: '', page: '1' })}>Filtrləri təmizlə</Button>
                ) : (
                  <Button onClick={() => changeFilter('view', 'all')}>Bütün məhsullara bax</Button>
                )
              }
            />
          ) : (
            <>
              <ProductsList products={pageItems} busyIds={busyIds} leavingIds={leavingIds} flashId={flashId} actions={listActions} />
              <Pagination page={page} pageCount={pageCount} total={shown.length} pageSize={PAGE_SIZE} onPageChange={(value) => changeFilter('page', String(value))} />
            </>
          )}
        </>
      )}

      <ProductEditorDrawer
        key={editor.key}
        open={editor.open}
        product={editorProduct}
        categories={categories}
        onClose={closeEditor}
        onSaved={onSaved}
        onProductChange={replaceProduct}
        onArchive={(product) => archive(product)}
        onRestore={(product) => restore(product)}
        onDelete={(product) => setConfirm({ product })}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title={deleting?.hasOrders ? 'Bu məhsul silinə bilməz' : `«${deleting?.name}» silinsin?`}
        tone={deleting?.hasOrders ? 'default' : 'danger'}
        confirmLabel={deleting?.hasOrders ? (deleting?.isActive ? 'Arxivlə' : 'Bağla') : 'Məhsulu sil'}
        busy={confirmBusy}
        onCancel={() => setConfirm(null)}
        onConfirm={deleting?.hasOrders && !deleting?.isActive ? () => setConfirm(null) : confirmDelete}
      >
        {deleting?.hasOrders ? (
          <>
            Məhsul sifarişlərdə istifadə olunub; silinsə, sifariş tarixçəsi boş qalar. Arxivləsəniz, mağazadan gizlənər,
            amma sifarişlər, rəylər və NexusERP SKU-ları qorunar.
          </>
        ) : (
          <>
            Bu əməliyyat geri qaytarıla bilməz. Məhsulla birlikdə{' '}
            <strong className="font-medium text-ink-900">{deleting?.variants.length} variant</strong>
            {deleting?.reviewCount ? (
              <>
                {' '}və <strong className="font-medium text-ink-900">{deleting.reviewCount} rəy</strong>
              </>
            ) : null}{' '}
            silinəcək. Yalnız gizlətmək istəyirsinizsə, arxivləyin.
          </>
        )}
      </ConfirmDialog>
    </div>
  )
}

function EmptyState({ icon: Icon, title, text, action }) {
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
