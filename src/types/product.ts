/**
 * Mikro-Aşama 5: Khazar hazır giyim ürün tipleri.
 * NexusERP entegrasyonu (Aşama 4) sırasında bu arayüzler API şemasına uyarlanacak.
 */

/** Bedenler — S … XXL (bazı ürünlerde XS de bulunur). */
export type Size = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'

/** Hazır giyim kategorileri (Header/Footer menüleriyle aynı dil). */
export type Category =
  | 'Hoodie'
  | 'T-Shirt'
  | 'Pants'
  | 'Sweatshirt'
  | 'Longsleeve'
  | 'Coat'

/** Rəng seçeneği — ad + gösterim rengi (hex). */
export interface ColorOption {
  name: string
  hex: string
}

/** Parça / kumaş detayları. */
export interface FabricDetails {
  /** Örn: "%100 Pambıq", "%80 Yun, 20% Polyamid" */
  material: string
  /** Örn: "Üç iplik", "French terry" */
  weave?: string
  /** Bakım talimatları. */
  care?: string[]
}

/**
 * Beden bazlı stok matrisi.
 * Yalnız stoğu olan bedenler listelenir; eksik beden = stokta yok.
 */
export type StockMatrix = Partial<Record<Size, number>>

export interface Product {
  id: string
  /** URL dostu ad (Örn: "zoho-oversize-sweatshirt"). */
  slug: string
  name: string
  description: string
  category: Category
  /** AZN cinsinden temel fiyat. */
  basePrice: number
  /** İndirim öncesi fiyat (varsa). */
  compareAtPrice?: number
  currency: 'AZN'
  colors: ColorOption[]
  sizes: Size[]
  images: string[]
  fabric: FabricDetails
  stock: StockMatrix
  isNew?: boolean
  isBestseller?: boolean
}
