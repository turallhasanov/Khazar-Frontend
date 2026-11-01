import { ImageOff, Trash2, Upload } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import { uploadImage } from '../../services/adminService.js'
import { ApiError, mediaUrl } from '../../services/api.js'
import { Button } from './adminUi.jsx'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 8 * 1024 * 1024

function describeUploadError(error) {
  if (error instanceof ApiError) {
    if (error.code === 'image_too_large' || error.status === 413) return 'Şəkil ən çox 8 MB ola bilər.'
    if (error.code === 'invalid_image') return 'Yalnız JPG, PNG və WebP şəkilləri qəbul olunur.'
    if (error.status === 0) return 'Serverə qoşulmaq mümkün olmadı.'
  }
  return 'Şəkil yüklənmədi.'
}

/**
 * Picks image files from the computer and uploads them to the API's images folder (POST /api/admin/images).
 * `onUploaded(path)` runs once per file with its "/images/…" path, in the order chosen.
 */
export function ImageUploadButton({ label = 'Şəkil seç', multiple = false, disabled = false, onUploaded }) {
  const inputId = useId()
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const upload = async (files) => {
    setError(null)
    const invalid = files.find((file) => !ACCEPTED_TYPES.includes(file.type) || file.size > MAX_BYTES)
    if (invalid) {
      setError(invalid.size > MAX_BYTES ? 'Şəkil ən çox 8 MB ola bilər.' : 'Yalnız JPG, PNG və WebP şəkilləri qəbul olunur.')
      return
    }

    setBusy(true)
    try {
      for (const file of files) {
        const { url } = await uploadImage(file)
        onUploaded(url)
      }
    } catch (uploadError) {
      setError(describeUploadError(uploadError))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        multiple={multiple}
        disabled={disabled || busy}
        className="sr-only"
        onChange={(event) => {
          const files = [...event.target.files]
          // Cleared so choosing the same file again still fires a change.
          event.target.value = ''
          if (files.length) upload(files)
        }}
      />
      <Button onClick={() => inputRef.current?.click()} disabled={disabled || busy}>
        <Upload size={13} strokeWidth={1.75} />
        {busy ? 'Yüklənir…' : label}
      </Button>
      {error && (
        <p role="alert" className="mt-1.5 animate-fade-in text-[11px] text-clay-600">
          {error}
        </p>
      )}
    </div>
  )
}

/** Single image field of the content forms: preview, replace, remove. The value is the stored "/images/…" path. */
export function ImageField({ value, onChange, controlProps }) {
  const [failedPath, setFailedPath] = useState(null)
  const broken = value && failedPath === value

  return (
    <div className="flex items-center gap-3" id={controlProps?.id}>
      <span className="flex h-16 w-12 shrink-0 items-center justify-center overflow-hidden border border-ink-900/10 bg-linen-100">
        {value && !broken ? (
          <img src={mediaUrl(value)} alt="" onError={() => setFailedPath(value)} className="h-full w-full object-cover" />
        ) : (
          <ImageOff size={15} strokeWidth={1.25} className="text-ink-400" />
        )}
      </span>
      <ImageUploadButton label={value ? 'Şəkli dəyiş' : 'Şəkil seç'} onUploaded={onChange} />
      {value && (
        <Button size="icon" variant="ghost" aria-label="Şəkli sil" title="Şəkli sil" onClick={() => onChange('')} className="hover:text-clay-600">
          <Trash2 size={13} strokeWidth={1.5} />
        </Button>
      )}
    </div>
  )
}
