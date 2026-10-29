import { Images } from 'lucide-react'
import { CollectionPage } from '../components/admin/content/CollectionPage.jsx'
import { useProductOptions } from '../components/admin/content/useProductOptions.js'
import { microLabelClass } from '../components/admin/adminUi.jsx'
import { lookbookLooksApi } from '../services/adminService.js'

const MAX_HOTSPOTS = 8
const round = (value) => Math.round(value * 10) / 10

/**
 * Photo preview of the look being edited: a click on the photo adds a hotspot there (product chosen below),
 * and the numbered markers match the hotspot list.
 */
function HotspotPicker({ value, onChange }) {
  if (!value.imageUrl) return null
  const hotspots = value.hotspots ?? []

  const add = (event) => {
    if (hotspots.length >= MAX_HOTSPOTS) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = round(((event.clientX - rect.left) / rect.width) * 100)
    const y = round(((event.clientY - rect.top) / rect.height) * 100)
    onChange({ ...value, hotspots: [...hotspots, { productSlug: '', x, y }] })
  }

  return (
    <div className="mb-6">
      <p className={`${microLabelClass} mb-2`}>Hotspot-lar</p>
      <div className="relative mx-auto w-full max-w-xs cursor-crosshair overflow-hidden border border-ink-900/10 bg-linen-100">
        <img src={value.imageUrl} alt="" onClick={add} className="aspect-[3/4] w-full select-none object-cover" draggable={false} />
        {hotspots.map((hotspot, index) => (
          <span
            key={index}
            aria-hidden="true"
            className={`pointer-events-none absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-[10px] font-medium ${
              hotspot.productSlug ? 'border-ink-900 bg-linen-50 text-ink-900' : 'border-clay-600 bg-clay-600 text-linen-50'
            }`}
            style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
          >
            {index + 1}
          </span>
        ))}
      </div>
      <p className="mt-2 text-center text-[11px] text-ink-400">
        Şəklin üzərinə klik edin — həmin nöqtədə hotspot yaranır, sonra aşağıda məhsulunu seçin.
      </p>
    </div>
  )
}

const baseConfig = {
  eyebrow: 'Məzmun',
  title: 'Lookbook',
  description:
    'Ana səhifədəki kombin kadrları və üzərlərindəki alış nöqtələri. Yalnız dərc olunanlar saytda görünür; nömrələr (01, 02…) sıraya görə verilir.',
  icon: Images,
  noun: 'kadr',
  api: lookbookLooksApi,
  emptyItem: (sortOrder) => ({
    title: '',
    imageUrl: '',
    ctaLabel: 'Kolleksiyanı kəşf et',
    ctaLink: '/katalog',
    hotspots: [],
    sortOrder,
    isPublished: false,
  }),
  toForm: (look) => ({
    title: look.title,
    imageUrl: look.imageUrl,
    ctaLabel: look.ctaLabel,
    ctaLink: look.ctaLink,
    hotspots: look.hotspots,
    sortOrder: look.sortOrder,
    isPublished: look.isPublished,
  }),
  itemTitle: (look) => look.title,
  itemSubtitle: (look) => `${look.hotspots.length} hotspot · ${look.ctaLink || '/katalog'}`,
  thumbnail: (look) => look.imageUrl,
  previewPath: () => '/',
  renderExtra: (props) => <HotspotPicker {...props} />,
  fields: [
    { key: 'title', label: 'Başlıq', required: true, maxLength: 150, wide: true },
    { key: 'imageUrl', label: 'Şəkil', type: 'image', required: true, hint: 'Şaquli (3:4) kadr; https://… və ya /media/…' },
    { key: 'ctaLabel', label: 'Link mətni', maxLength: 100 },
    { key: 'ctaLink', label: 'Link', type: 'link', maxLength: 300 },
    {
      key: 'hotspots',
      label: 'Alış nöqtələri',
      type: 'items',
      itemLabel: 'Hotspot',
      max: MAX_HOTSPOTS,
      newItem: () => ({ productSlug: '', x: 50, y: 50 }),
      fields: [
        { key: 'productSlug', label: 'Məhsul', type: 'product', required: true, wide: true },
        { key: 'x', label: 'Üfüqi mövqe (%)', type: 'number', max: 100, step: 0.5 },
        { key: 'y', label: 'Şaquli mövqe (%)', type: 'number', max: 100, step: 0.5 },
      ],
    },
    { key: 'sortOrder', label: 'Sıra', type: 'number', max: 10000, step: 10, hint: 'Kiçik rəqəm əvvəl gəlir.' },
    { key: 'isPublished', label: 'Saytda dərc et', type: 'toggle', hint: 'Söndürülsə, kadr saytda görünmür.' },
  ],
}

/** /admin/lookbook — lookbook looks (GET/POST/PUT/DELETE /api/admin/lookbook-looks). */
export function AdminLookbookPage() {
  const products = useProductOptions()
  return <CollectionPage config={{ ...baseConfig, context: { products } }} />
}
