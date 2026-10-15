import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import defaultContent from '../data/editorialCMS.json'

/**
 * Editoryal CMS katmanı — Hero, slogan bandı və vitrin bloklarının içərik
 * mənbəyi. Varsayılanlar `editorialCMS.json`dan gəlir; /admin/editorial
 * panelindəki dəyişikliklər localStorage override-ı ilə anında səyfəyə
 * əks olunur. NexusERP inteqrasiyasında bu kontekst API-dən qidalanacaq.
 */

const STORAGE_KEY = 'khazar-editorial-v1'

/** Varsayılan içeriği localStorage override'ıyla bölüm düzeyinde birleştirir. */
function loadContent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultContent
    const stored = JSON.parse(raw)
    return {
      hero: { ...defaultContent.hero, ...stored.hero },
      slogan: { ...defaultContent.slogan, ...stored.slogan },
      featureBlocks: {
        shipping: { ...defaultContent.featureBlocks.shipping, ...stored.featureBlocks?.shipping },
        faq: { ...defaultContent.featureBlocks.faq, ...stored.featureBlocks?.faq },
      },
      // Yeni ana sayfa bölümleri (diziler override'ta tamamen değiştirilir)
      manifesto: { ...defaultContent.manifesto, ...stored.manifesto },
      lookbook: { ...defaultContent.lookbook, ...stored.lookbook },
      craftsmanship: { ...defaultContent.craftsmanship, ...stored.craftsmanship },
      journal: { ...defaultContent.journal, ...stored.journal },
    }
  } catch {
    return defaultContent
  }
}

const EditorialContext = createContext(null)

export function EditorialProvider({ children }) {
  const [content, setContent] = useState(loadContent)

  // Kalıcılık: her değişiklikte localStorage'a yaz
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content))
  }, [content])

  const updateHero = (patch) =>
    setContent((current) => ({ ...current, hero: { ...current.hero, ...patch } }))

  const updateSlogan = (patch) =>
    setContent((current) => ({ ...current, slogan: { ...current.slogan, ...patch } }))

  const updateFeatureBlock = (blockKey, patch) =>
    setContent((current) => ({
      ...current,
      featureBlocks: {
        ...current.featureBlocks,
        [blockKey]: { ...current.featureBlocks[blockKey], ...patch },
      },
    }))

  const resetEditorial = () => {
    localStorage.removeItem(STORAGE_KEY)
    setContent(defaultContent)
  }

  const value = useMemo(
    () => ({ content, updateHero, updateSlogan, updateFeatureBlock, resetEditorial }),
    [content],
  )

  return <EditorialContext.Provider value={value}>{children}</EditorialContext.Provider>
}

// oxlint-disable-next-line react/only-export-components -- provider + hook birlikte tutulur (fast-refresh uyarısı bilinçli bastırıldı)
export function useEditorial() {
  const context = useContext(EditorialContext)
  if (!context) {
    throw new Error('useEditorial must be used within an EditorialProvider')
  }
  return context
}
