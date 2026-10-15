import { Lock, RotateCcw, Unlock } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useEditorial } from '../context/EditorialContext'

/** Demo giriş kodu — gerçek yetkilendirme Aşama 4'te API ile değişəcək. */
const ADMIN_CODE = 'khazar-2026'
const AUTH_KEY = 'khazar-editorial-auth'

const labelClass = 'block text-[10px] font-medium uppercase tracking-[0.25em] text-ink-400'
const inputClass =
  'mt-2 w-full border border-ink-900/20 bg-linen-50 px-3.5 py-2.5 text-sm tracking-wide text-ink-900 outline-none transition-colors placeholder:text-ink-300 focus:border-ink-900'
const sectionTitleClass = 'text-[11px] font-medium uppercase tracking-[0.3em] text-ink-900'

function TextField({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={inputClass}
      />
    </div>
  )
}

/** Kod qapısı — sadə simulyasiya; sessionStorage-da saxlanılır. */
function PasscodeGate({ onUnlock }) {
  const [code, setCode] = useState('')
  const [failed, setFailed] = useState(false)

  const submit = (event) => {
    event.preventDefault()
    if (code.trim() === ADMIN_CODE) {
      sessionStorage.setItem(AUTH_KEY, '1')
      onUnlock()
    } else {
      setFailed(true)
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <form
        onSubmit={submit}
        className="flex w-full max-w-sm flex-col gap-5 border border-linen-200 bg-linen-100/60 px-8 py-10"
      >
        <span className="flex h-11 w-11 items-center justify-center border border-ink-900/20 text-ink-700">
          <Lock size={18} strokeWidth={1.5} />
        </span>
        <div>
          <h1 className="font-display text-2xl text-ink-900">Editorial Panel</h1>
          <p className="mt-1 text-xs leading-relaxed text-ink-400">
            Davam etmək üçün redaktor kodunu daxil edin.
          </p>
        </div>
        <div>
          <label className={labelClass}>Kod</label>
          <input
            type="password"
            value={code}
            onChange={(event) => {
              setCode(event.target.value)
              setFailed(false)
            }}
            placeholder="••••••••"
            className={`${inputClass} ${failed ? 'border-clay-600' : ''}`}
          />
          {failed && <p className="mt-1.5 text-[11px] text-clay-600">Kod yanlışdır</p>}
        </div>
        <button
          type="submit"
          className="bg-ink-900 py-3.5 text-[11px] font-medium uppercase tracking-[0.35em] text-linen-50 transition-colors hover:bg-clay-600"
        >
          Daxil ol
        </button>
      </form>
    </main>
  )
}

/**
 * Gizli editoryal düzəliş paneli (/admin/editorial) — canlı redaktə:
 * hər dəyişiklik EditorialContext-ə yazılır, localStorage-da saxlanılır və
 * saytın ana səhifəsinə dərhal əks olunur. Sessiyalı giriş kodu ilə qorunur.
 */
export function EditorialAdminPage() {
  const { content, updateHero, updateSlogan, updateFeatureBlock, resetEditorial } =
    useEditorial()
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(AUTH_KEY) === '1')

  if (!unlocked) {
    return <PasscodeGate onUnlock={() => setUnlocked(true)} />
  }

  const { hero, slogan, featureBlocks } = content
  const setSloganLine = (index, value) =>
    updateSlogan({ lines: slogan.lines.map((line, i) => (i === index ? value : line)) })

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="flex items-baseline justify-between">
          <h1 className="font-display text-3xl text-ink-900">Editorial Panel</h1>
          <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] text-sage-600">
            <Unlock size={13} strokeWidth={1.5} />
            Canlı rejim
          </span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-ink-500">
          Dəyişikliklər dərhal ana səhifəyə əks olunur və bu brauzerdə saxlanılır.
          <Link to="/" className="ml-1 underline underline-offset-4 hover:text-clay-600">
            Nəticəyə bax
          </Link>
        </p>

        {/* Hero banner */}
        <section className="mt-12 border-t border-linen-200 pt-8">
          <h2 className={sectionTitleClass}>Hero Banner</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <TextField label="Üst etiket (kicker)" value={hero.kicker} onChange={(v) => updateHero({ kicker: v })} />
            <TextField label="Üst başlıq sətri" value={hero.titleTop} onChange={(v) => updateHero({ titleTop: v })} />
            <TextField label="Başlıq sətri 1" value={hero.titleLine1} onChange={(v) => updateHero({ titleLine1: v })} />
            <TextField label="Başlıq sətri 2 (vurğu)" value={hero.titleLine2} onChange={(v) => updateHero({ titleLine2: v })} />
            <TextField label="Qiymət etiketi" value={hero.priceLabel} onChange={(v) => updateHero({ priceLabel: v })} />
            <TextField label="CTA mətni" value={hero.ctaLabel} onChange={(v) => updateHero({ ctaLabel: v })} />
            <TextField label="CTA linki" value={hero.ctaLink} onChange={(v) => updateHero({ ctaLink: v })} placeholder="/katalog" />
            <div className="sm:col-span-2">
              <TextField
                label="Hero görsel URL (boş = varsayılan görsel)"
                value={hero.imageUrl}
                onChange={(v) => updateHero({ imageUrl: v })}
                placeholder="https://…"
              />
            </div>
          </div>
        </section>

        {/* Slogan bandı */}
        <section className="mt-12 border-t border-linen-200 pt-8">
          <h2 className={sectionTitleClass}>Slogan Bandı</h2>
          <p className="mt-2 text-xs text-ink-400">
            Vurğu üçün sözü *ulduz* işarələri arasına alın.
          </p>
          <div className="mt-5 grid gap-5">
            {slogan.lines.map((line, index) => (
              <TextField
                key={index}
                label={`Sətir ${index + 1}`}
                value={line}
                onChange={(v) => setSloganLine(index, v)}
              />
            ))}
          </div>
        </section>

        {/* Vitrin blokları */}
        <section className="mt-12 border-t border-linen-200 pt-8">
          <h2 className={sectionTitleClass}>Vitrin Blokları</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <TextField
              label="SHIPPING başlığı"
              value={featureBlocks.shipping.title}
              onChange={(v) => updateFeatureBlock('shipping', { title: v })}
            />
            <TextField
              label="FAQ başlığı"
              value={featureBlocks.faq.title}
              onChange={(v) => updateFeatureBlock('faq', { title: v })}
            />
            <div className="sm:col-span-2">
              <TextField
                label="SHIPPING mətni"
                value={featureBlocks.shipping.text}
                onChange={(v) => updateFeatureBlock('shipping', { text: v })}
              />
            </div>
            <div className="sm:col-span-2">
              <TextField
                label="FAQ mətni"
                value={featureBlocks.faq.text}
                onChange={(v) => updateFeatureBlock('faq', { text: v })}
              />
            </div>
            <TextField
              label="FAQ görsel URL (boş = varsayılan)"
              value={featureBlocks.faq.imageUrl}
              onChange={(v) => updateFeatureBlock('faq', { imageUrl: v })}
              placeholder="https://…"
            />
          </div>
        </section>

        <div className="mt-12 flex flex-wrap items-center gap-4 border-t border-linen-200 pt-8">
          <button
            type="button"
            onClick={resetEditorial}
            className="flex items-center gap-2 border border-ink-900/20 px-6 py-3 text-[11px] uppercase tracking-[0.3em] text-ink-700 transition-colors hover:border-clay-600 hover:text-clay-600"
          >
            <RotateCcw size={14} strokeWidth={1.5} />
            Varsayılanlara qayıt
          </button>
          <span className="text-[11px] text-ink-400">
            Bütün dəyişikliklər avtomatik yadda saxlanılır.
          </span>
        </div>
      </div>
    </main>
  )
}
