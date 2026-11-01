/**
 * Kolleksiya naviqasiyası — kataloqdakı real kateqoriyalardan qurulan mətn tabları (say ilə).
 * Tək seçim: "Hamısı" filtri sıfırlayır. Mobildə üfüqi sürüşür.
 * Aktiv tab: tünd mətn + 2px torpaq tonlu alt xətt; passivlər solğun. Say mətnin yanında yuvarlaq rozetdir.
 * Fokusda heç bir çərçivə/qutu yoxdur — klaviatura fokusu mətnin tündləşməsi və alt xətlə göstərilir.
 */
export function CatalogCategoryTabs({ categories, active, total, onChange }) {
  const tabs = [{ value: null, label: 'Hamısı', count: total }, ...categories]

  return (
    <nav
      aria-label="Kateqoriyalar"
      className="-mx-4 overflow-x-auto border-b border-linen-200 px-4 [scrollbar-width:none] sm:mx-0 sm:px-0"
    >
      <ul className="flex min-w-max items-end gap-7 md:gap-9">
        {tabs.map((tab) => {
          const selected = tab.value === active
          return (
            <li key={tab.value ?? 'all'}>
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => onChange(tab.value)}
                className={`relative -mb-px flex items-center border-b-2 pb-3 font-display text-lg tracking-[0.02em] outline-none transition-colors duration-300 focus:outline-none focus:ring-0 md:text-xl ${
                  selected
                    ? 'border-clay-600 text-ink-900'
                    : 'border-transparent text-ink-500 hover:border-ink-400 hover:text-ink-900 focus-visible:border-ink-400 focus-visible:text-ink-900'
                }`}
              >
                {tab.label}
                <span
                  className={`ml-2 rounded-full bg-linen-200/60 px-2 py-0.5 font-sans text-[11px] leading-none tabular-nums transition-colors duration-300 ${
                    selected ? 'text-ink-700' : 'text-ink-500'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
