import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useContentSection, useSiteContent } from '../context/SiteContentContext'
import { ApiError } from '../services/api.js'
import { articlePath, getJournalArticle } from '../services/contentService.js'
import { hideBrokenImage } from '../services/imageFallback.js'
import { useLiveRefresh } from '../services/liveUpdates.js'

/**
 * Jurnal məqaləsi (/journal/:slug) — GET /api/content/journal/{slug}; məqalələr admin panelinin Jurnal
 * səhifəsində yazılır. Ana səhifədəki "Oxu" kartları bura yönləndirir; aşağıda digər dərc olunmuş məqalələr.
 */
export function JournalArticlePage() {
  const { slug } = useParams()
  const journal = useContentSection('journal')
  const otherArticles = (useSiteContent().content?.journal ?? []).filter((item) => item.slug !== slug)
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState({ key: null, article: null, status: 'loading' })
  const requestKey = `${slug}#${attempt}`

  useEffect(() => {
    const controller = new AbortController()
    getJournalArticle(slug, { signal: controller.signal })
      .then((article) => setResult({ key: requestKey, article, status: 'ready' }))
      .catch((error) => {
        if (error.name === 'AbortError') return
        setResult({ key: requestKey, article: null, status: error instanceof ApiError && error.status === 404 ? 'missing' : 'error' })
      })
    return () => controller.abort()
  }, [slug, requestKey])

  useLiveRefresh('content', () => setAttempt((current) => current + 1))

  // A refresh of the same article keeps it on screen; another slug starts from the loading state.
  const sameArticle = result.article?.slug === slug
  const status = result.key === requestKey ? result.status : sameArticle ? 'ready' : 'loading'
  const article = status === 'ready' ? result.article : null

  if (status === 'loading') {
    return (
      <main className="flex-1" aria-busy="true">
        <div className="h-72 animate-pulse border-b border-linen-200 bg-linen-100" />
      </main>
    )
  }

  if (!article) {
    return (
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-32 text-center">
          <h1 className="font-display text-3xl text-ink-900">
            {status === 'missing' ? 'Məqalə tapılmadı' : 'Məqalə yüklənmədi'}
          </h1>
          {status === 'error' && (
            <button
              type="button"
              onClick={() => setAttempt((current) => current + 1)}
              className="mt-6 text-[11px] uppercase tracking-[0.3em] text-ink-500 underline underline-offset-4 hover:text-clay-600"
            >
              Yenidən cəhd et
            </button>
          )}
          <Link
            to="/"
            className="mt-8 block w-fit border border-ink-900 px-8 py-3 text-[11px] uppercase tracking-[0.3em] text-ink-900 transition-colors hover:bg-ink-900 hover:text-linen-50 mx-auto"
          >
            Ana səhifəyə qayıt
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1">
      <article>
        <header className="border-b border-linen-200 bg-linen-100">
          <div className="mx-auto max-w-3xl px-6 py-14 text-center md:py-20">
            <p className="text-[10px] font-medium uppercase tracking-[0.45em] text-ink-400">
              {[journal?.eyebrow, article.meta].filter(Boolean).join(' · ')}
            </p>
            <h1 className="mt-5 font-display text-4xl font-light tracking-[0.03em] text-ink-900 md:text-5xl">
              {article.title}
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-sm font-light leading-relaxed text-ink-500">
              {article.excerpt}
            </p>
          </div>
        </header>

        <div className="mx-auto max-w-4xl px-6 pt-12 md:pt-16">
          <img
            src={article.coverImageUrl}
            onError={hideBrokenImage}
            alt={article.title}
            className="aspect-[16/9] w-full object-cover"
          />
        </div>

        <div className="mx-auto max-w-2xl px-6 py-12 md:py-16">
          {article.sections.map((section, index) => (
            <section key={index} className="mt-10 first:mt-0">
              {section.heading && (
                <h2 className="font-display text-2xl tracking-[0.02em] text-ink-900">
                  {section.heading}
                </h2>
              )}
              {section.paragraphs.map((paragraph, paragraphIndex) => (
                <p
                  key={paragraphIndex}
                  className="mt-4 text-[15px] font-light leading-relaxed text-ink-700 first:mt-0"
                >
                  {paragraph}
                </p>
              ))}
              {section.imageUrl && (
                <img
                  src={section.imageUrl}
                  onError={hideBrokenImage}
                  alt={section.imageAlt}
                  loading="lazy"
                  className="mt-8 aspect-[4/3] w-full object-cover"
                />
              )}
            </section>
          ))}

          <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-linen-200 pt-8">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.3em] text-ink-700 transition-colors hover:text-clay-600"
            >
              <ArrowLeft size={13} strokeWidth={1.5} />
              Ana səhifə
            </Link>
            <Link
              to="/katalog"
              className="border border-ink-900 px-8 py-3 text-[11px] uppercase tracking-[0.3em] text-ink-900 transition-colors hover:bg-ink-900 hover:text-linen-50"
            >
              Kataloqa bax
            </Link>
          </div>
        </div>
      </article>

      {otherArticles.length > 0 && (
        <section className="border-t border-linen-200 bg-linen-100/50">
          <div className="mx-auto max-w-4xl px-6 py-14">
            <p className="text-[10px] uppercase tracking-[0.4em] text-ink-400">Digər məqalələr</p>
            <ul className="mt-6 divide-y divide-linen-200">
              {otherArticles.map((item) => (
                <li key={item.id}>
                  <Link
                    to={articlePath(item.slug)}
                    className="group flex items-center justify-between gap-4 py-5 transition-colors hover:text-clay-600"
                  >
                    <span className="font-display text-xl tracking-[0.02em]">{item.title}</span>
                    <ArrowUpRight
                      size={16}
                      strokeWidth={1.5}
                      className="shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </main>
  )
}
