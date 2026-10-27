import { BadgeCheck, Search, X } from 'lucide-react'
import { Button, FilterField, Select, TextInput } from '../adminUi.jsx'
import { SORT_OPTIONS, hasRefinements } from './reviewFilters.js'

/** Search, star / product / date / verified-buyer filters and sorting. Every control writes to the URL query. */
export function ReviewsToolbar({ filters, products, resultCount, onChange, onClear }) {
  const refined = hasRefinements(filters)

  return (
    <section aria-label="Axtarış və filtrlər" className="mt-6 border border-linen-200 bg-linen-100/40 p-4 sm:p-5">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]">
        <FilterField label="Axtarış" className="md:col-span-2 xl:col-span-1">
          <span className="relative block">
            <Search
              size={15}
              strokeWidth={1.5}
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
            />
            <TextInput
              type="search"
              value={filters.q}
              onChange={(event) => onChange('q', event.target.value)}
              placeholder="Ad, rəy mətni və ya məhsul…"
              className="pl-9 pr-9 [&::-webkit-search-cancel-button]:hidden"
            />
            {filters.q && (
              <button
                type="button"
                aria-label="Axtarışı təmizlə"
                onClick={() => onChange('q', '')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-ink-400 transition-colors hover:text-ink-900"
              >
                <X size={14} strokeWidth={1.5} />
              </button>
            )}
          </span>
        </FilterField>

        <FilterField label="Ulduz">
          <Select value={filters.rating} onChange={(event) => onChange('rating', event.target.value)}>
            <option value="">Bütün ulduzlar</option>
            {[5, 4, 3, 2, 1].map((star) => (
              <option key={star} value={star}>
                {'★'.repeat(star)} · {star}
              </option>
            ))}
          </Select>
        </FilterField>

        <FilterField label="Məhsul">
          <Select value={filters.product} onChange={(event) => onChange('product', event.target.value)}>
            <option value="">Bütün məhsullar</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </Select>
        </FilterField>

        <FilterField label="Sıralama">
          <Select value={filters.sort} onChange={(event) => onChange('sort', event.target.value)}>
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FilterField>
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-3">
        <FilterField label="Tarixdən" className="w-[calc(50%-0.375rem)] sm:w-40">
          <TextInput
            type="date"
            value={filters.from}
            max={filters.to || undefined}
            onChange={(event) => onChange('from', event.target.value)}
          />
        </FilterField>
        <FilterField label="Tarixədək" className="w-[calc(50%-0.375rem)] sm:w-40">
          <TextInput
            type="date"
            value={filters.to}
            min={filters.from || undefined}
            onChange={(event) => onChange('to', event.target.value)}
          />
        </FilterField>

        <button
          type="button"
          aria-pressed={filters.verified === '1'}
          onClick={() => onChange('verified', filters.verified === '1' ? '' : '1')}
          className={`flex h-10 items-center gap-2 border px-3.5 text-[10px] font-medium uppercase tracking-[0.2em] transition-colors duration-200 ${
            filters.verified === '1'
              ? 'border-sage-600 bg-sage-600 text-linen-50'
              : 'border-ink-900/15 bg-linen-50 text-ink-500 hover:border-ink-900/30 hover:text-ink-900'
          }`}
        >
          <BadgeCheck size={14} strokeWidth={1.5} />
          Təsdiqlənmiş alıcı
        </button>

        <div className="ml-auto flex items-center gap-3">
          <p className="text-[11px] tabular-nums text-ink-500" aria-live="polite">
            {resultCount} nəticə
          </p>
          {refined && (
            <Button size="sm" variant="ghost" onClick={onClear} className="animate-fade-in">
              <X size={13} strokeWidth={1.5} />
              Filtrləri təmizlə
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}
