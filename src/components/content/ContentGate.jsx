import { useSiteContent } from '../../context/SiteContentContext'

/**
 * Renders a page once the site content has loaded. With `section`, `children` is a function that receives that
 * section; a section the admin panel never saved shows a short notice instead of an empty page.
 * While loading: a quiet placeholder of the page header's size. On failure: a retry, in the catalog's error style.
 */
export function ContentGate({ section, children }) {
  const { content, status, reload } = useSiteContent()

  if (status === 'loading') {
    return (
      <main className="flex-1" aria-busy="true">
        <div className="h-64 animate-pulse border-b border-linen-200 bg-linen-100 md:h-80" />
      </main>
    )
  }

  if (status === 'error') {
    return (
      <ContentNotice title="Səhifə yüklənmədi" text="Serverə qoşulmaq mümkün olmadı. Bir az sonra yenidən yoxlayın.">
        <button
          type="button"
          onClick={reload}
          className="mt-8 border border-ink-900 px-8 py-3 text-[11px] uppercase tracking-[0.3em] text-ink-900 transition-colors hover:bg-ink-900 hover:text-linen-50"
        >
          Yenidən cəhd et
        </button>
      </ContentNotice>
    )
  }

  if (!section) return children

  const data = content.sections?.[section]
  return data ? children(data) : <ContentNotice title="Səhifə hazırlanır" text="Bu səhifənin məzmunu tezliklə əlavə olunacaq." />
}

function ContentNotice({ title, text, children }) {
  return (
    <main className="flex-1">
      <div className="mx-auto max-w-xl px-6 py-32 text-center">
        <p className="font-display text-2xl font-light text-ink-700">{title}</p>
        <p className="mt-2 text-sm font-light text-ink-400">{text}</p>
        {children}
      </div>
    </main>
  )
}
