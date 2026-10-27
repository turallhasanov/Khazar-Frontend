import { Archive, ArchiveRestore, ExternalLink, ImageOff, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { formatPrice } from '../../../services/formatPrice.js'
import { formatDateTime, formatRelative } from '../reviews/reviewFilters.js'
import { ActionMenu, Button, microLabelClass } from '../adminUi.jsx'
import { ProductStatusBadge } from './ProductStatusBadge.jsx'
import { LOW_STOCK } from './productForm.js'

const rowMotion = 'transition-[opacity,transform,background-color] duration-200 ease-soft'

function Thumb({ product, size = 'md' }) {
  const [failed, setFailed] = useState(false)
  const sizeClass = size === 'lg' ? 'h-20 w-16' : 'h-12 w-10'
  return (
    <span className={`flex shrink-0 items-center justify-center overflow-hidden border border-linen-200 bg-linen-100 ${sizeClass}`}>
      {failed ? (
        <ImageOff size={14} strokeWidth={1.25} className="text-ink-400" />
      ) : (
        <img
          src={product.coverImage}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className={`h-full w-full object-cover ${product.isActive ? '' : 'opacity-60 grayscale'}`}
        />
      )}
    </span>
  )
}

function StockCell({ product }) {
  const tone =
    product.totalStock === 0 ? 'text-clay-600' : product.totalStock <= LOW_STOCK ? 'text-clay-500' : 'text-ink-900'
  return (
    <span>
      <span className={`text-sm tabular-nums ${tone}`}>{product.totalStock === 0 ? 'Stokda yoxdur' : `${product.totalStock} ədəd`}</span>
      <span className="block text-[11px] text-ink-400">{product.variants.length} variant</span>
    </span>
  )
}

/** The "⋯" menu: every action stays listed; unavailable ones say why. */
function menuItems(product, { onEdit, onArchive, onRestore, onDelete }) {
  return [
    { label: 'Redaktə et', icon: Pencil, onSelect: () => onEdit(product) },
    {
      label: 'Mağazada bax',
      icon: ExternalLink,
      disabled: !product.isActive,
      hint: product.isActive ? null : 'Arxivdədir — mağazada görünmür',
      onSelect: () => window.open(`/mehsul/${product.slug}`, '_blank', 'noopener'),
    },
    product.isActive
      ? { label: 'Arxivlə', icon: Archive, hint: 'Mağazadan gizlədilir, məlumat qalır', onSelect: () => onArchive(product) }
      : { label: 'Bərpa et', icon: ArchiveRestore, hint: 'Yenidən mağazada görünür', onSelect: () => onRestore(product) },
    {
      label: 'Sil',
      icon: Trash2,
      tone: 'danger',
      disabled: product.hasOrders,
      hint: product.hasOrders ? 'Sifarişlərdə var — yalnız arxivləmək olar' : 'Geri qaytarıla bilməz',
      onSelect: () => onDelete(product),
    },
  ]
}

export function ProductsList({ products, busyIds, leavingIds, flashId, actions }) {
  const rowState = (product) =>
    `${leavingIds.has(product.id) ? 'pointer-events-none translate-x-3 opacity-0' : ''} ${
      flashId === product.id ? 'animate-row-flash' : ''
    } ${busyIds.has(product.id) ? 'opacity-60' : ''}`

  return (
    <>
      <table className="mt-6 hidden w-full table-fixed border-collapse xl:table">
        <thead>
          <tr className="border-b border-ink-900/10 text-left">
            <th scope="col" className={`${microLabelClass} pb-3 font-medium`}>Məhsul</th>
            <th scope="col" className={`${microLabelClass} w-[13%] pb-3 font-medium`}>Kateqoriya</th>
            <th scope="col" className={`${microLabelClass} w-[11%] pb-3 font-medium`}>Qiymət</th>
            <th scope="col" className={`${microLabelClass} w-[13%] pb-3 font-medium`}>Stok</th>
            <th scope="col" className={`${microLabelClass} w-[13%] pb-3 font-medium`}>Status</th>
            <th scope="col" className={`${microLabelClass} w-[11%] pb-3 font-medium`}>Yenilənib</th>
            <th scope="col" className="w-[88px] pb-3">
              <span className="sr-only">Əməliyyatlar</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr
              key={product.id}
              onClick={() => actions.onEdit(product)}
              className={`group cursor-pointer border-b border-linen-200 align-middle hover:bg-linen-100/60 ${rowMotion} ${rowState(product)}`}
            >
              <td className="py-3 pr-4">
                <div className="flex items-center gap-3">
                  <Thumb product={product} />
                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        actions.onEdit(product)
                      }}
                      className="block max-w-full truncate text-left text-sm text-ink-900 outline-none group-hover:underline group-hover:decoration-ink-900/30 group-hover:underline-offset-4 focus-visible:underline focus-visible:decoration-clay-500"
                    >
                      {product.name}
                    </button>
                    <p className="truncate font-mono text-[11px] text-ink-400">/{product.slug}</p>
                  </div>
                </div>
              </td>
              <td className="truncate py-3 pr-4 text-xs text-ink-700">{product.category}</td>
              <td className="py-3 pr-4 text-sm tabular-nums text-ink-900">{formatPrice(product.price)}</td>
              <td className="py-3 pr-4"><StockCell product={product} /></td>
              <td className="py-3 pr-4"><ProductStatusBadge product={product} /></td>
              <td className="py-3 pr-4 text-xs text-ink-500" title={formatDateTime(product.updatedAt ?? product.createdAt)}>
                {formatRelative(product.updatedAt ?? product.createdAt)}
              </td>
              <td className="py-3">
                <div className="flex justify-end gap-1" onClick={(event) => event.stopPropagation()}>
                  <Button size="icon" variant="ghost" aria-label={`Redaktə et: ${product.name}`} title="Redaktə et" onClick={() => actions.onEdit(product)}>
                    <Pencil size={14} strokeWidth={1.5} />
                  </Button>
                  <ActionMenu label={`${product.name} üçün əməliyyatlar`} items={menuItems(product, actions)} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="mt-6 space-y-3 xl:hidden">
        {products.map((product) => (
          <li key={product.id} className={`${rowMotion} ${rowState(product)}`}>
            <article className="flex gap-4 border border-linen-200 bg-linen-50 p-4 transition-colors hover:border-ink-900/20">
              <Thumb product={product} size="lg" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <button type="button" onClick={() => actions.onEdit(product)} className="block max-w-full truncate text-left text-sm text-ink-900">
                      {product.name}
                    </button>
                    <p className="truncate text-[11px] text-ink-400">
                      {product.category} · {formatPrice(product.price)}
                    </p>
                  </div>
                  <ActionMenu label={`${product.name} üçün əməliyyatlar`} items={menuItems(product, actions)} />
                </div>
                <div className="mt-3 flex flex-wrap items-end justify-between gap-2">
                  <StockCell product={product} />
                  <ProductStatusBadge product={product} />
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </>
  )
}
