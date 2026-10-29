import { X } from 'lucide-react'
import { useCallback, useEffect } from 'react'
import { useContentSection } from '../../context/SiteContentContext'

/**
 * Beden Ölçü Rehberi Modali.
 * - Göğüs / Bel / Boyun ölçü tablosu (sm) — başlıq, mətn və sətirlər admin panelindəki "sizeGuide" bölməsindən
 * - Ürün detayındaki "Beden Ölçü Rehberi" bağlantısıyla açılır
 * - ESC ve perde tıklamasıyla kapanır, açıkken arka plan kaydırması kilitli
 */
export function SizeGuideModal({ open, onClose }) {
  const guide = useContentSection('sizeGuide')
  const rows = guide?.rows ?? []
  const modelSize = guide?.modelSize
  const close = useCallback(() => onClose(), [onClose])

  // ESC ile kapatma + kaydırma kilidi
  useEffect(() => {
    if (!open) return undefined
    const handleKey = (event) => {
      if (event.key === 'Escape') close()
    }
    document.addEventListener('keydown', handleKey)
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.documentElement.style.overflow = ''
    }
  }, [open, close])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/50 backdrop-blur-sm sm:items-center"
      onClick={close}
      role="presentation"
    >
      <div
        className="relative w-full max-w-lg bg-linen-50 p-8 sm:m-6"
        role="dialog"
        aria-modal="true"
        aria-label="Beden ölçü rehberi"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Bağla"
          className="absolute right-4 top-4 text-ink-400 transition-colors hover:text-ink-900"
        >
          <X size={18} strokeWidth={1.5} />
        </button>

        <p className="text-[10px] uppercase tracking-[0.35em] text-ink-400">
          {guide?.eyebrow}
        </p>
        <h2 className="mt-2 font-display text-3xl font-light text-ink-900">
          {guide?.title || 'Ölçü cədvəli'}
        </h2>
        {guide?.text && <p className="mt-3 text-sm leading-relaxed text-ink-500">{guide.text}</p>}

        {/* Ölçü tablosu */}
        {rows.length > 0 && (
        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b border-ink-900/15 text-left text-[10px] uppercase tracking-[0.25em] text-ink-400">
              <th className="py-3 pr-4 font-normal">Ölçü</th>
              <th className="py-3 pr-4 font-normal">Göğüs</th>
              <th className="py-3 pr-4 font-normal">Bel</th>
              <th className="py-3 font-normal">Boyun</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.size}
                className={`border-b border-ink-900/8 ${
                  modelSize && row.size === modelSize ? 'bg-linen-100' : ''
                }`}
              >
                <td className="py-3 pr-4 text-xs tracking-[0.15em] text-ink-900">
                  {row.size}
                  {modelSize && row.size === modelSize && (
                    <span className="ml-2 text-[9px] uppercase tracking-[0.2em] text-clay-600">
                      Model
                    </span>
                  )}
                </td>
                <td className="py-3 pr-4 text-ink-500">{row.chest}</td>
                <td className="py-3 pr-4 text-ink-500">{row.waist}</td>
                <td className="py-3 text-ink-500">{row.neck}</td>
              </tr>
            ))}
          </tbody>
        </table>
        )}

        {guide?.modelNote && <p className="mt-5 text-xs leading-relaxed text-ink-400">{guide.modelNote}</p>}
      </div>
    </div>
  )
}
