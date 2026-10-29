/**
 * Admin form of every content section (GET/PUT /api/admin/content/sections/{key}); keys and fields mirror
 * Khazar.Application/Content/ContentSections.cs. `preview` is the storefront page that shows the section.
 */

const accentHint = 'Vurğu üçün sözü *ulduz* işarələri arasına alın.'
const linkHint = 'Saytdakı səhifə (/katalog) və ya https:// ünvanı.'
const imageHint = 'Şəklin ünvanı: https://… və ya saytdakı fayl (/media/…).'

const pageHeader = {
  key: 'header',
  label: 'Səhifə başlığı',
  type: 'group',
  fields: [
    { key: 'eyebrow', label: 'Üst etiket' },
    { key: 'title', label: 'Başlıq' },
    { key: 'description', label: 'Təsvir', type: 'textarea', rows: 3, maxLength: 1000 },
  ],
}

const titledText = (itemLabel, max) => ({
  type: 'items',
  itemLabel,
  max,
  newItem: () => ({ title: '', text: '' }),
  fields: [
    { key: 'title', label: 'Başlıq', wide: true },
    { key: 'text', label: 'Mətn', type: 'textarea', rows: 3, maxLength: 1000 },
  ],
})

export const SECTION_GROUPS = [
  { label: 'Sayt', keys: ['site', 'search'] },
  { label: 'Ana səhifə', keys: ['hero', 'newArrivals', 'manifesto', 'lookbook', 'slogan', 'featureBlocks', 'craftsmanship', 'journal'] },
  { label: 'Səhifələr', keys: ['catalog', 'about', 'faqPage', 'shipping', 'contact', 'sizeGuide'] },
]

export const SECTIONS = {
  site: {
    title: 'Naviqasiya, əlaqə və footer',
    description:
      'Header-dəki linklər, footer və Əlaqə səhifəsindəki telefon, e-poçt, ünvan və iş saatları. Mobil menyu kateqoriyaları avtomatik kataloqdan götürür.',
    preview: '/',
    fields: [
      {
        key: 'headerLinks',
        label: 'Header linkləri («Kataloq»dan sonra)',
        type: 'items',
        itemLabel: 'Link',
        max: 4,
        hint: 'Kateqoriyaya link: /katalog?kateqoriya=palto. Boş siyahı — yalnız «Kataloq» görünür.',
        newItem: () => ({ label: '', to: '' }),
        fields: [
          { key: 'label', label: 'Mətn', maxLength: 40 },
          { key: 'to', label: 'Link', type: 'link', maxLength: 300, placeholder: '/haqqimizda' },
        ],
      },
      { key: 'phone', label: 'Telefon', placeholder: '+994 50 555 01 44' },
      { key: 'email', label: 'E-poçt', placeholder: 'hello@khazar.az' },
      { key: 'address', label: 'Ünvan', wide: true },
      { key: 'workingHours', label: 'İş saatları', wide: true },
      { key: 'footerHeading', label: 'Footer başlığı', hint: accentHint, wide: true },
      { key: 'copyright', label: 'Müəllif hüququ sətri', wide: true },
      { key: 'footerNote', label: 'Footer qeydi', wide: true },
    ],
  },
  search: {
    title: 'Axtarış',
    description: 'Axtarış pəncərəsi boş olanda təklif edilən sözlər. Kateqoriyalar avtomatik kataloqdan gəlir.',
    preview: '/',
    fields: [{ key: 'trendingSearches', label: 'Trend axtarışlar', type: 'strings', itemLabel: 'Söz', max: 10 }],
  },
  hero: {
    title: 'Hero banner',
    description: 'Ana səhifənin ilk ekranı. Rəng, ölçü və qiymət seçilmiş məhsuldan gəlir.',
    preview: '/',
    fields: [
      { key: 'kicker', label: 'Üst etiket' },
      { key: 'titleTop', label: 'Üst başlıq sətri' },
      { key: 'titleLine1', label: 'Başlıq sətri 1' },
      { key: 'titleLine2', label: 'Başlıq sətri 2 (vurğu)' },
      { key: 'productSlug', label: 'Hero məhsulu', type: 'product', hint: 'Rəng, ölçü, stok və qiymət bu məhsuldan.', wide: true },
      { key: 'priceLabel', label: 'Qiymət etiketi', hint: 'Boş qalsa məhsulun qiyməti göstərilir.' },
      { key: 'ctaLabel', label: 'Düymə mətni' },
      { key: 'ctaLink', label: 'Düymə linki', type: 'link', hint: 'Boş qalsa məhsul səhifəsinə aparır.' },
      { key: 'secondaryLinkLabel', label: 'İkinci link mətni' },
      { key: 'secondaryLinkTo', label: 'İkinci link', type: 'link', hint: linkHint },
      { key: 'imageUrl', label: 'Əsas şəkil', type: 'image', hint: imageHint },
      { key: 'imageAlt', label: 'Əsas şəklin təsviri (alt)', wide: true },
      { key: 'sideImageUrl', label: 'İkinci şəkil', type: 'image', hint: 'Boş qalsa yalnız əsas şəkil göstərilir.' },
      { key: 'sideImageAlt', label: 'İkinci şəklin təsviri (alt)', wide: true },
      { key: 'captionLeft', label: 'Şəkil altı yazı (sol)' },
      { key: 'captionRight', label: 'Şəkil altı yazı (sağ)' },
      { key: 'signature', label: 'Şaquli imza', wide: true },
    ],
  },
  newArrivals: {
    title: 'Yeni gələnlər',
    description: 'Hero-dan sonrakı vitrin. Məhsullar kataloqdan avtomatik seçilir («Yeni» işarəlilər öndə).',
    preview: '/',
    fields: [
      { key: 'eyebrow', label: 'Üst etiket' },
      { key: 'title', label: 'Başlıq', hint: accentHint },
      { key: 'linkLabel', label: 'Link mətni' },
      { key: 'linkTo', label: 'Link', type: 'link', hint: linkHint },
    ],
  },
  manifesto: {
    title: 'Brend manifesti',
    preview: '/',
    fields: [
      { key: 'eyebrow', label: 'Üst etiket' },
      { key: 'signature', label: 'İmza' },
      { key: 'title', label: 'Başlıq', type: 'textarea', rows: 2, hint: `Hər sətir ayrıca başlıq sətridir. ${accentHint}` },
      { key: 'paragraphs', label: 'Paraqraflar', type: 'strings', multiline: true, itemLabel: 'Paraqraf', max: 6 },
    ],
  },
  lookbook: {
    title: 'Lookbook başlığı',
    description: 'Kadrların özü «Lookbook» bölməsində idarə olunur.',
    preview: '/',
    fields: [
      { key: 'eyebrow', label: 'Üst etiket' },
      { key: 'title', label: 'Başlıq' },
    ],
  },
  slogan: {
    title: 'Slogan bandı',
    description: 'Tünd bandda böyük şriftlə göstərilən sətirlər.',
    preview: '/',
    fields: [{ key: 'lines', label: 'Sətirlər', type: 'strings', itemLabel: 'Sətir', max: 6, hint: accentHint }],
  },
  featureBlocks: {
    title: 'Vitrin blokları',
    description: 'Slogan bandının altındakı iki məlumat bloku.',
    preview: '/',
    fields: ['shipping', 'faq'].map((key) => ({
      key,
      label: key === 'shipping' ? 'Sol blok (çatdırılma)' : 'Sağ blok (FAQ, şəkilli)',
      type: 'group',
      fields: [
        { key: 'title', label: 'Başlıq' },
        { key: 'linkLabel', label: 'Link mətni' },
        { key: 'text', label: 'Mətn', type: 'textarea', rows: 3, maxLength: 1000 },
        { key: 'linkTo', label: 'Link', type: 'link', hint: linkHint, wide: true },
        ...(key === 'faq' ? [{ key: 'imageUrl', label: 'Şəkil', type: 'image', hint: 'Boş qalsa blok şəkilsiz göstərilir.' }] : []),
      ],
    })),
  },
  craftsmanship: {
    title: 'Ustalıq',
    preview: '/',
    fields: [
      { key: 'eyebrow', label: 'Üst etiket' },
      { key: 'title', label: 'Başlıq' },
      { key: 'text', label: 'Mətn', type: 'textarea', rows: 4, maxLength: 1500 },
      { key: 'imageUrl', label: 'Şəkil', type: 'image', hint: imageHint },
      { key: 'imageAlt', label: 'Şəklin təsviri (alt)', wide: true },
      { key: 'highlights', label: 'Vurğular', ...titledText('Vurğu', 6) },
    ],
  },
  journal: {
    title: 'Jurnal başlığı',
    description: 'Məqalələr «Jurnal» bölməsində idarə olunur.',
    preview: '/',
    fields: [
      { key: 'eyebrow', label: 'Üst etiket' },
      { key: 'title', label: 'Başlıq' },
    ],
  },
  catalog: {
    title: 'Kataloq qapağı',
    preview: '/katalog',
    fields: [
      { key: 'eyebrow', label: 'Üst etiket' },
      { key: 'title', label: 'Başlıq' },
      { key: 'subtitle', label: 'Alt başlıq (italik)', wide: true },
      { key: 'description', label: 'Təsvir', type: 'textarea', rows: 3, maxLength: 1000 },
      { key: 'coverImageUrl', label: 'Qapaq şəkli', type: 'image', hint: imageHint },
      { key: 'coverImageAlt', label: 'Şəklin təsviri (alt)', wide: true },
    ],
  },
  about: {
    title: 'Haqqımızda',
    preview: '/haqqimizda',
    fields: [
      pageHeader,
      { key: 'coverImageUrl', label: 'Qapaq şəkli', type: 'image', hint: imageHint },
      { key: 'coverImageAlt', label: 'Şəklin təsviri (alt)' },
      { key: 'coverCaption', label: 'Şəkil üstü yazı' },
      { key: 'quote', label: 'Sitat', type: 'textarea', rows: 3, maxLength: 1000 },
      { key: 'quoteAuthor', label: 'Sitatın müəllifi', wide: true },
      { key: 'pillars', label: 'Sütunlar', ...titledText('Sütun', 6) },
      { key: 'ctaEyebrow', label: 'Son blok — üst etiket' },
      { key: 'ctaTitle', label: 'Son blok — başlıq' },
      { key: 'ctaLabel', label: 'Düymə mətni' },
      { key: 'ctaLink', label: 'Düymə linki', type: 'link', hint: linkHint },
    ],
  },
  faqPage: {
    title: 'FAQ səhifəsi',
    description: 'Suallar «FAQ» bölməsində idarə olunur.',
    preview: '/tez-tez-verilen-suallar',
    fields: [pageHeader],
  },
  shipping: {
    title: 'Çatdırılma və iadə',
    preview: '/catdirilma-ve-iade',
    fields: [
      pageHeader,
      { key: 'deliveryTitle', label: 'Cədvəl başlığı', wide: true },
      {
        key: 'deliveryRows',
        label: 'Çatdırılma cədvəli',
        type: 'items',
        itemLabel: 'Sətir',
        max: 12,
        newItem: () => ({ region: '', time: '', fee: '' }),
        fields: [
          { key: 'region', label: 'Region' },
          { key: 'time', label: 'Müddət' },
          { key: 'fee', label: 'Məbləğ', wide: true },
        ],
      },
      { key: 'deliveryNote', label: 'Cədvəl altı qeyd', type: 'textarea', rows: 3, maxLength: 1000 },
      { key: 'returnsTitle', label: 'İadə bölməsinin başlığı', wide: true },
      { key: 'returnSteps', label: 'İadə addımları', ...titledText('Addım', 6) },
    ],
  },
  contact: {
    title: 'Əlaqə səhifəsi',
    description: 'Telefon, e-poçt və ünvan «Əlaqə və footer» bölməsindən gəlir.',
    preview: '/elaqe',
    fields: [
      pageHeader,
      { key: 'showroomTitle', label: 'Showroom başlığı', wide: true },
      { key: 'showroomNote', label: 'Showroom qeydi', type: 'textarea', rows: 3, maxLength: 1000 },
    ],
  },
  sizeGuide: {
    title: 'Ölçü bələdçisi',
    description: 'Məhsul səhifəsindəki «Ölçü cədvəli» pəncərəsi (sm).',
    preview: '/katalog',
    fields: [
      { key: 'eyebrow', label: 'Üst etiket' },
      { key: 'title', label: 'Başlıq' },
      { key: 'text', label: 'Mətn', type: 'textarea', rows: 3, maxLength: 1000 },
      {
        key: 'rows',
        label: 'Ölçülər',
        type: 'items',
        itemLabel: 'Ölçü',
        max: 12,
        newItem: () => ({ size: '', chest: '', waist: '', neck: '' }),
        fields: [
          { key: 'size', label: 'Ölçü', maxLength: 20 },
          { key: 'chest', label: 'Sinə', maxLength: 30 },
          { key: 'waist', label: 'Bel', maxLength: 30 },
          { key: 'neck', label: 'Boyun', maxLength: 30 },
        ],
      },
      { key: 'modelSize', label: 'Modelin ölçüsü', hint: 'Cədvəldə vurğulanır.', maxLength: 20 },
      { key: 'modelNote', label: 'Cədvəl altı qeyd', wide: true },
    ],
  },
}
