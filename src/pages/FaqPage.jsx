import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ContentGate } from '../components/content/ContentGate.jsx'
import { PageHeader } from '../components/layout/PageHeader'
import { useSiteContent } from '../context/SiteContentContext'

function FaqItem({ item, open, onToggle }) {
  return (
    <div className="border-b border-linen-200">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-6 py-5 text-left"
      >
        <span className="font-display text-lg font-light tracking-[0.02em] text-ink-900">
          {item.question}
        </span>
        <ChevronDown
          size={16}
          strokeWidth={1.5}
          className={`shrink-0 text-ink-400 transition-transform duration-300 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      {open && (
        <p className="max-w-3xl whitespace-pre-line pb-6 text-sm font-light leading-relaxed text-ink-500">
          {item.answer}
        </p>
      )}
    </div>
  )
}

/**
 * Tez-tez verilən suallar (/tez-tez-verilen-suallar) — minimalist akordeon sorğu-cavab səhifəsi.
 * Başlıq "faqPage" bölməsindən, suallar admin panelinin FAQ səhifəsindən (yalnız dərc olunanlar).
 */
export function FaqPage() {
  return <ContentGate section="faqPage">{(page) => <FaqContent page={page} />}</ContentGate>
}

function FaqContent({ page }) {
  const items = useSiteContent().content.faq
  const [openId, setOpenId] = useState(() => items[0]?.id ?? null)

  return (
    <main className="flex-1">
      <PageHeader eyebrow={page.header.eyebrow} title={page.header.title} description={page.header.description} />

      <section className="mx-auto max-w-3xl px-6 py-16 md:py-20">
        <div className="border-t border-linen-200">
          {items.map((item) => (
            <FaqItem
              key={item.id}
              item={item}
              open={openId === item.id}
              onToggle={() => setOpenId(openId === item.id ? null : item.id)}
            />
          ))}
        </div>

        <p className="mt-10 text-center text-sm font-light text-ink-500">
          Cavab tapmadınız?{' '}
          <Link to="/elaqe" className="underline underline-offset-4 hover:text-clay-600">
            Bizimlə əlaqə saxlayın
          </Link>
          .
        </p>
      </section>
    </main>
  )
}
