import { Info, RotateCcw } from 'lucide-react'
import { AdminPageHeader } from '../components/admin/adminUi.jsx'
import { useEditorial } from '../context/EditorialContext'

const labelClass = 'block text-[10px] font-medium uppercase tracking-[0.25em] text-ink-400'
const inputClass =
  'mt-2 w-full border border-ink-900/20 bg-linen-50 px-3.5 py-2.5 text-sm tracking-wide text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-ink-900'
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

/**
 * Gizli editoryal düzəliş paneli (/admin/editorial) — canlı redaktə:
 * hər dəyişiklik EditorialContext-ə yazılır, localStorage-da saxlanılır və
 * bu brauzerdə ana səhifəyə dərhal əks olunur (serverə yazılmır). Giriş AdminLayout-dadır: yalnız backend-in admin kimi
 * təsdiqlədiyi hesablar (GET /api/admin/session) bu səhifəni görür.
 */
export function EditorialAdminPage() {
  const { content, updateHero, updateSlogan, updateFeatureBlock, resetEditorial } =
    useEditorial()
  const { hero, slogan, featureBlocks } = content
  const setSloganLine = (index, value) =>
    updateSlogan({ lines: slogan.lines.map((line, i) => (i === index ? value : line)) })

  return (
    <div className="mx-auto max-w-3xl">
      <AdminPageHeader
        eyebrow="Məzmun"
        title="Editorial"
        description="Ana səhifənin hero bannerini, slogan bandını və vitrin bloklarını redaktə edin."
        actions={
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="text-[10px] uppercase tracking-[0.3em] text-ink-500 underline-offset-4 transition-colors hover:text-clay-600 hover:underline"
          >
            Nəticəyə bax
          </a>
        }
      />
      {/* EditorialContext has no API behind it yet: say so instead of implying the site changes for everyone. */}
      <p className="mt-6 flex gap-2 border border-clay-500/30 bg-clay-50 px-4 py-3 text-xs leading-relaxed text-clay-700">
        <Info size={14} strokeWidth={1.75} className="mt-0.5 shrink-0" />
        Dəyişikliklər yalnız bu brauzerdə saxlanılır və ziyarətçilərə görünmür — bu bölmə hələ serverə qoşulmayıb.
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
  )
}
