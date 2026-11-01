import { ArrowLeft, ArrowRight, GripVertical, ImageOff, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { mediaUrl } from '../../../services/api.js'
import { Button, Select, microLabelClass } from '../adminUi.jsx'
import { ImageUploadButton } from '../ImageUpload.jsx'
import { LIMITS, newGalleryImage } from './productForm.js'

/**
 * Product gallery editor: photos in display order (1st = catalog cover, 2nd = the card's hover photo), each optionally
 * tied to one of the product's colors so the storefront shows it when that color is chosen. Reorder by dragging a tile
 * (mouse) or with the arrow buttons (keyboard, touch). Saved with the product fields.
 */
export function GalleryEditor({ images, colors, error, onChange }) {
  const [dragKey, setDragKey] = useState(null)
  const [overKey, setOverKey] = useState(null)
  const full = images.length >= LIMITS.images

  // Several chosen files finish one by one: `latest` keeps each upload from overwriting the one before it.
  const latest = useRef(images)
  useEffect(() => {
    latest.current = images
  })
  const add = (url) => {
    if (latest.current.length >= LIMITS.images) return
    latest.current = [...latest.current, newGalleryImage(url)]
    onChange(latest.current)
  }

  const move = (from, to) => {
    if (to < 0 || to >= images.length || from === to) return
    const next = [...images]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    onChange(next)
  }

  const replace = (key, patch) => onChange(images.map((image) => (image.key === key ? { ...image, ...patch } : image)))

  const dropOn = (targetKey) => {
    if (dragKey && dragKey !== targetKey) {
      move(
        images.findIndex((image) => image.key === dragKey),
        images.findIndex((image) => image.key === targetKey),
      )
    }
    setDragKey(null)
    setOverKey(null)
  }

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className={microLabelClass}>
          Qalereya <span className="text-clay-600">*</span>
        </span>
        <span className="text-[10px] tabular-nums text-ink-400">
          {images.length}/{LIMITS.images}
        </span>
      </div>
      <p className="mb-3 text-[11px] leading-relaxed text-ink-400">
        1-ci şəkil kataloq kartında, 2-ci kartın üzərinə gələndə görünür. Şəkli rəngə bağlasanız, saytda həmin rəng
        seçiləndə o şəkil göstərilir. Sıranı sürüşdürərək dəyişin.
      </p>
      {error && <p className="mb-3 animate-fade-in text-[11px] text-clay-600">{error}</p>}

      {images.length > 0 && (
        <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((image, index) => (
            <li
              key={image.key}
              draggable
              onDragStart={(event) => {
                setDragKey(image.key)
                event.dataTransfer.effectAllowed = 'move'
              }}
              onDragOver={(event) => {
                event.preventDefault()
                setOverKey(image.key)
              }}
              onDragLeave={() => setOverKey((current) => (current === image.key ? null : current))}
              onDrop={(event) => {
                event.preventDefault()
                dropOn(image.key)
              }}
              onDragEnd={() => {
                setDragKey(null)
                setOverKey(null)
              }}
              className={`group relative border bg-linen-50 transition-[border-color,opacity,transform] duration-200 ${
                dragKey === image.key ? 'opacity-40' : ''
              } ${overKey === image.key && dragKey !== image.key ? 'border-clay-500 -translate-y-0.5' : 'border-ink-900/10'}`}
            >
              <div className="relative aspect-[3/4] cursor-grab overflow-hidden bg-linen-100 active:cursor-grabbing">
                <GalleryThumb url={image.url} />
                <span className="absolute left-2 top-2 bg-linen-50/95 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.18em] text-ink-700">
                  {index === 0 ? 'Əsas' : index === 1 ? 'Hover' : String(index + 1).padStart(2, '0')}
                </span>
                <GripVertical
                  size={16}
                  strokeWidth={1.5}
                  aria-hidden="true"
                  className="absolute right-2 top-2 text-linen-50 opacity-0 drop-shadow transition-opacity group-hover:opacity-100"
                />
              </div>
              <div className="space-y-2 p-2">
                <Select
                  aria-label={`Şəkil ${index + 1} rəngi`}
                  value={image.color}
                  onChange={(event) => replace(image.key, { color: event.target.value })}
                  className="[&_select]:h-8 [&_select]:text-[12px]"
                >
                  <option value="">Rəngə bağlı deyil</option>
                  {colors.map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                  {image.color && !colors.includes(image.color) && <option value={image.color}>{image.color} (variant yoxdur)</option>}
                </Select>
                <div className="flex justify-between">
                  <div className="flex">
                    <Button size="icon" variant="ghost" aria-label="Sola" title="Sola" disabled={index === 0} onClick={() => move(index, index - 1)}>
                      <ArrowLeft size={13} strokeWidth={1.5} />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Sağa"
                      title="Sağa"
                      disabled={index === images.length - 1}
                      onClick={() => move(index, index + 1)}
                    >
                      <ArrowRight size={13} strokeWidth={1.5} />
                    </Button>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Şəkil ${index + 1}-i sil`}
                    title="Sil"
                    disabled={images.length === 1}
                    onClick={() => onChange(images.filter((entry) => entry.key !== image.key))}
                    className="hover:text-clay-600"
                  >
                    <Trash2 size={13} strokeWidth={1.5} />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}

      <div className="mt-3">
        <ImageUploadButton label={full ? 'Qalereya doludur' : 'Şəkil əlavə et'} multiple disabled={full} onUploaded={add} />
        <p className="mt-1.5 text-[11px] text-ink-400">JPG, PNG və ya WebP, ən çox 8 MB. Bir neçə faylı birdən seçmək olar.</p>
      </div>
    </div>
  )
}

function GalleryThumb({ url }) {
  const [failedUrl, setFailedUrl] = useState(null)
  if (failedUrl === url) {
    return (
      <span className="flex h-full flex-col items-center justify-center gap-1.5 px-2 text-center text-[10px] text-ink-400">
        <ImageOff size={18} strokeWidth={1.25} />
        Şəkil yüklənmədi
      </span>
    )
  }
  return (
    <img
      src={mediaUrl(url)}
      alt=""
      draggable={false}
      onError={() => setFailedUrl(url)}
      className="h-full w-full animate-fade-in object-cover"
    />
  )
}
