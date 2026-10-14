import type { Product } from '../types/product'

/**
 * Mikro-Aşama 5: Gerçekçi hazır giyim mock verisi.
 * Editoryal ürün görselleri — Unsplash (moda çekimleri, tümü doğrulanmış).
 * NOT: Aşama 4'te NexusERP API'siyle değiştirilecek; görsel alanları API'ye uyarlanacak.
 */

const img = (id: string, w = 900) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`

export const mockProducts: Product[] = [
  {
    id: 'p-001',
    slug: 'zoho-oversize-sweatshirt',
    name: 'Zoho Oversize Sweatshirt',
    description:
      'Avropa üç ipliyi ilə toxunmuş, möhkəm mansetli oversize fit svitshot. Limited seriya.',
    category: 'Sweatshirt',
    basePrice: 84,
    currency: 'AZN',
    colors: [
      { name: 'Boz', hex: '#9a9a94' },
      { name: 'Bej', hex: '#d8cbb4' },
      { name: 'Qara', hex: '#26241f' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    images: [img('1576871337622-98d48d1cf531'), img('1556821840-3a63f95609a7')],
    fabric: {
      material: '%80 Pambıq, %20 Polyester',
      weave: 'Üç iplik (three-thread)',
      care: ['30°C-də paltaryuyanda yuma', 'Təbii qurutma', 'Ütüləmə: orta temperatur'],
    },
    stock: { XS: 4, S: 12, M: 20, L: 8, XL: 3 },
    isBestseller: true,
  },
  {
    id: 'p-002',
    slug: 'european-cotton-t-shirt',
    name: 'European Cotton T-Shirt',
    description:
      'Yüksək qramajlı Avropa pambığından, yaxa hissəsi gücləndirilmiş klassik fit t-shirt.',
    category: 'T-Shirt',
    basePrice: 39.9,
    currency: 'AZN',
    colors: [
      { name: 'Ağ', hex: '#f5f4ef' },
      { name: 'Qara', hex: '#1d1c1a' },
      { name: 'Haki', hex: '#6d6a4f' },
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: [img('1521572163474-6864f9cf17ab'), img('1562157873-818bc0726f68')],
    fabric: {
      material: '%100 Pambıq',
      weave: 'Tək iplik, 220 q/m²',
      care: ['30°C-də paltaryuyanda yuma', 'Ağartıcı istifadə etməyin'],
    },
    stock: { S: 15, M: 25, L: 18, XL: 10, XXL: 6 },
  },
  {
    id: 'p-003',
    slug: 'minimalist-cargo-pants',
    name: 'Minimalist Cargo Pants',
    description:
      'Geniş bacaqlı, düşük profilli cib detallı minimalist cargo şalvar. Toka ilə tənzimlənən bel.',
    category: 'Pants',
    basePrice: 98,
    currency: 'AZN',
    colors: [
      { name: 'Qum', hex: '#c9b99a' },
      { name: 'Tünd boz', hex: '#4c4a45' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    images: [img('1542272604-787c3835535d'), img('1552902865-b72c031ac5ea')],
    fabric: {
      material: '%97 Pambıq, %3 Elastan',
      weave: 'Twill',
      care: ['30°C-də çevirməli yuma', 'Təmiz qurutma tövsiyə olunmur'],
    },
    stock: { S: 7, M: 14, L: 11, XL: 5 },
  },
  {
    id: 'p-004',
    slug: 'heavyweight-hoodie',
    name: 'Heavyweight Hoodie',
    description:
      '400 q/m² ağır parça, ön cəbi və ikiqat qapşonlu premium hoodie. Fırçalanmış iç səth.',
    category: 'Hoodie',
    basePrice: 89,
    currency: 'AZN',
    colors: [
      { name: 'Antrasit', hex: '#3a3a38' },
      { name: 'Krem', hex: '#ece5d8' },
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: [img('1556821840-3a63f95609a7'), img('1576871337622-98d48d1cf531')],
    fabric: {
      material: '%85 Pambıq, %15 Polyester',
      weave: 'French terry, 400 q/m²',
      care: ['30°C-də yuma', 'Sərin ütü'],
    },
    stock: { S: 9, M: 16, L: 12, XL: 7, XXL: 2 },
    isNew: true,
  },
  {
    id: 'p-005',
    slug: 'merino-longsleeve',
    name: 'Merino Longsleeve',
    description:
      'İncə merino yun qarışımlı, dəriyə yumşaq toxunan longsleeve. Mövsüm keçidinin əsas parçası.',
    category: 'Longsleeve',
    basePrice: 64,
    currency: 'AZN',
    colors: [
      { name: 'Krem', hex: '#e6ddc9' },
      { name: 'Tünd yaşıl', hex: '#3d4a3a' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    images: [img('1434389677669-e08b4cac3105'), img('1603252109303-2751441dd157')],
    fabric: {
      material: '%50 Merino yun, %50 Viskoz',
      care: ['Yalnız əllə yuma', 'Yaxa formasını qorumaq üçün asaraq qurudun'],
    },
    stock: { S: 6, M: 10, L: 9, XL: 4 },
  },
  {
    id: 'p-006',
    slug: 'tailored-wool-coat',
    name: 'Tailored Wool Coat',
    description:
      'Klassik kişi siluetli, yun qarışımlı palto. Sıx tikişli yaxa, gizli düyməli bağlanma.',
    category: 'Coat',
    basePrice: 289,
    compareAtPrice: 340,
    currency: 'AZN',
    colors: [
      { name: 'Dəvə', hex: '#b49a6c' },
      { name: 'Qara', hex: '#1d1c1a' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    images: [img('1539533018447-63fcce2678e3'), img('1544022613-e87ca75a784a')],
    fabric: {
      material: '%70 Yun, %30 Polyamid',
      weave: 'Sarja',
      care: ['Yalnız peşəkar təmizləmə'],
    },
    stock: { S: 3, M: 8, L: 6, XL: 2 },
    isBestseller: true,
  },
  {
    id: 'p-007',
    slug: 'vintage-wash-sweatshirt',
    name: 'Vintage Wash Sweatshirt',
    description:
      'Köhnəlmə (vintage wash) effektli, yumuşaq toxunuşlu svitshot. Düşük omuz, rahat fit.',
    category: 'Sweatshirt',
    basePrice: 79,
    currency: 'AZN',
    colors: [
      { name: 'Tozlu mavi', hex: '#8b9bab' },
      { name: 'Qəhvəyi', hex: '#7a5c44' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    images: [img('1620799140408-edc6dcb6d633'), img('1576871337622-98d48d1cf531')],
    fabric: {
      material: '%100 Pambıq',
      weave: 'Üç iplik, enzim yuma',
      care: ['30°C-də yuma', 'Enzim yuma effekti hər parçada fərqli ola bilər'],
    },
    stock: { S: 11, M: 17, L: 9, XL: 5 },
  },
  {
    id: 'p-008',
    slug: 'essential-oversize-t-shirt',
    name: 'Essential Oversize T-Shirt',
    description:
      'Gündəlik istifadə üçün hazırlanmış düşük omuzlu oversize t-shirt. Limitsiz kombin.',
    category: 'T-Shirt',
    basePrice: 44,
    currency: 'AZN',
    colors: [
      { name: 'Ağ', hex: '#f5f4ef' },
      { name: 'Bej', hex: '#d8cbb4' },
      { name: 'Qara', hex: '#1d1c1a' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    images: [img('1562157873-818bc0726f68'), img('1603252109303-2751441dd157')],
    fabric: {
      material: '%100 Pambıq',
      weave: 'Tək iplik, 240 q/m²',
      care: ['30°C-də yuma', 'Təbii qurutma'],
    },
    stock: { XS: 5, S: 14, M: 22, L: 16, XL: 9, XXL: 4 },
    isNew: true,
  },
  {
    id: 'p-009',
    slug: 'pleated-wide-pants',
    name: 'Pleated Wide Pants',
    description:
      'Qatlı (pleated) bel detaylı, geniş bacaqlı klassik şalvar. İstirahət və ofis üçün uyğun.',
    category: 'Pants',
    basePrice: 112,
    currency: 'AZN',
    colors: [
      { name: 'Qara', hex: '#1d1c1a' },
      { name: 'Boz', hex: '#8f8c86' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    images: [img('1594633312681-425c7b97ccd1'), img('1584370848010-d7fe6bc767ec')],
    fabric: {
      material: '%64 Poliester, %34 Viskoz, %2 Elastan',
      care: ['30°C-də yuma', 'Orta temperaturda ütü'],
    },
    stock: { S: 8, M: 13, L: 10, XL: 6 },
  },
  {
    id: 'p-010',
    slug: 'double-face-coat',
    name: 'Double-Face Coat',
    description:
      'İki üzlü yun parçadan, içi kürklə əvəzlənən isti qış paltosu. Minimal kəsik, maksimal rahatlıq.',
    category: 'Coat',
    basePrice: 340,
    currency: 'AZN',
    colors: [
      { name: 'Qara', hex: '#1d1c1a' },
      { name: 'Dəvə', hex: '#b49a6c' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    images: [img('1551028719-00167b16eac5'), img('1539533018447-63fcce2678e3')],
    fabric: {
      material: '%80 Yun, %20 Kaşmir',
      care: ['Yalnız peşəkar təmizləmə', 'Saxlama konstruktorunda asın'],
    },
    stock: { S: 2, M: 6, L: 5, XL: 1 },
    isNew: true,
  },
]
