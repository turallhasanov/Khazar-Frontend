import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEditorial } from '../../context/EditorialContext'
import { hideBrokenImage } from '../../services/imageFallback.js'

/**
 * Ana səhifə zənginləşdirməsi — Editoryal Jurnal.
 * 2 minimalist stil/dərgi məqaləsi kartı.
 */
export function EditorialJournal() {
  const { content } = useEditorial()
  const journal = content.journal

  return (
    <section className="bg-linen-50">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-ink-400">
              {journal.eyebrow}
            </p>
            <h2 className="mt-4 font-display text-3xl tracking-[0.02em] text-ink-900 md:text-4xl">
              {journal.title}
            </h2>
          </div>
          <span className="hidden text-[10px] uppercase tracking-[0.3em] text-ink-400 md:block">
            {String(journal.articles.length).padStart(2, '0')} məqalə
          </span>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 md:gap-6">
          {journal.articles.map((article) => (
            <article key={article.slug} className="group border border-linen-200 bg-linen-100/50">
              <div className="overflow-hidden">
                <img
                  src={article.image}
                  onError={hideBrokenImage}
                  alt={article.title}
                  loading="lazy"
                  className="aspect-[16/9] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
              </div>
              <div className="p-7">
                <p className="text-[10px] uppercase tracking-[0.25em] text-ink-400">
                  {article.meta}
                </p>
                <h3 className="mt-3 font-display text-2xl leading-snug tracking-[0.02em] text-ink-900">
                  {article.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-500">{article.excerpt}</p>
                <Link
                  to={article.href}
                  className="mt-6 inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.3em] text-ink-900 underline-offset-4 transition-colors hover:text-clay-600 hover:underline"
                >
                  Oxu
                  <ArrowUpRight
                    size={13}
                    strokeWidth={1.5}
                    className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
