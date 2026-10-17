import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/layout/PageHeader'

const FAQ_ITEMS = [
  {
    question: 'Hansı ödəniş üsulları mövcuddur?',
    answer:
      'Bank kartı (Visa / Mastercard), qapıda nağd və qapıda terminal ilə ödəyə bilərsiniz. Kart ödənişləri tam şifrələnmiş kanalla emal olunur; sifariş təsdiqi dərhal e-poçtunuza göndərilir.',
  },
  {
    question: 'Çatdırılma nə qədər vaxt aparır?',
    answer:
      'Bakı daxili 1–2 iş günü, regionlara 3–5 iş günü ərzində çatdırılma edilir. 150 ₼ üzəri sifarişlərdə çatdırılma pulsuzdur; ekspress çatdırılma seçimi eyni gün təhvil verir (+10 ₼).',
  },
  {
    question: 'Ölçü seçimində necə rəhbərliyə bilərəm?',
    answer:
      'Hər məhsulun səhifəsində beden matrisi və stok göstəricisi var. Oversize modellərdə adətən bir ölçü kiçik seçilməsi tövsiyə olunur; dəqiq ölçü cədvəli üçün məhsulun "Material" bölməsindəki toxuma qramajına baxın.',
  },
  {
    question: 'İadə şərtləri nədir?',
    answer:
      'Məhsulu təhvil aldıqdan sonra 14 gün ərzində qaytarə bilərsiniz. Parça etiketi sökülməmiş, istifadə və yuma izi olmayan məhsullar tam geri ödənilir. Ətraflı: Çatdırılma və İadə səhifəsi.',
  },
  {
    question: 'Sifarişimi necə izləyə bilərəm?',
    answer:
      'Sifariş təsdiqində #KHZ- ilə başlayan nömrəniz var. Hər hansı sualda bu nömrəni göstərərək +994 50 555 01 44 nömrəsinə və ya hello@khazar.az ünvanına yaza bilərsiniz.',
  },
  {
    question: 'Məhsullar limited seriyadırmı?',
    answer:
      'Bəli — hər kolleksiya məhdud sayda toxunur və bəziləri bir daha təkrarlanmır. "Limited seriya" etiketli məhsullar bitdikdə yenidən istehsal olunmur.',
  },
]

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
        <p className="max-w-3xl pb-6 text-sm font-light leading-relaxed text-ink-500">
          {item.answer}
        </p>
      )}
    </div>
  )
}

/**
 * Tez-tez verilən suallar (/tez-tez-verilen-suallar) —
 * minimalist akordeon sorğu-cavab səhifəsi.
 */
export function FaqPage() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <main className="flex-1">
      <PageHeader
        eyebrow="FAQ"
        title="Tez-tez verilən suallar"
        description="Ödəniş, çatdırılma, ölçü seçimi və iadə haqqında ən çox verilən sualların cavabları."
      />

      <section className="mx-auto max-w-3xl px-6 py-16 md:py-20">
        <div className="border-t border-linen-200">
          {FAQ_ITEMS.map((item, index) => (
            <FaqItem
              key={item.question}
              item={item}
              open={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
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
