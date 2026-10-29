import { BookOpen } from 'lucide-react'
import { CollectionPage } from '../components/admin/content/CollectionPage.jsx'
import { articlePath } from '../services/contentService.js'
import { journalArticlesApi } from '../services/adminService.js'

const newSection = () => ({ heading: '', paragraphs: [''], imageUrl: '', imageAlt: '' })

const config = {
  eyebrow: 'Məzmun',
  title: 'Jurnal',
  description:
    'Ana səhifədəki «Stil qeydləri» məqalələri və /journal/… səhifələri. Yalnız dərc olunanlar saytda görünür, kiçik sıra nömrəsi əvvəl gəlir.',
  icon: BookOpen,
  noun: 'məqalə',
  api: journalArticlesApi,
  slugFrom: 'title',
  emptyItem: (sortOrder) => ({
    slug: '',
    title: '',
    excerpt: '',
    coverImageUrl: '',
    meta: 'Dərgi · 5 dəqiqə',
    sections: [newSection()],
    sortOrder,
    isPublished: false,
  }),
  toForm: (article) => ({
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    coverImageUrl: article.coverImageUrl,
    meta: article.meta,
    sections: article.sections,
    sortOrder: article.sortOrder,
    isPublished: article.isPublished,
  }),
  itemTitle: (article) => article.title,
  itemSubtitle: (article) => `${articlePath(article.slug)} · ${article.meta}`,
  thumbnail: (article) => article.coverImageUrl,
  previewPath: (article) => articlePath(article.slug),
  fields: [
    { key: 'title', label: 'Başlıq', required: true, maxLength: 200, wide: true },
    { key: 'slug', label: 'Slug (URL)', required: true, maxLength: 150, type: 'link', hint: 'Başlıqdan avtomatik; /journal/… ünvanı.' },
    { key: 'meta', label: 'Meta sətri', maxLength: 100, placeholder: 'Dərgi · 5 dəqiqə' },
    { key: 'excerpt', label: 'Qısa təsvir', type: 'textarea', rows: 3, maxLength: 500 },
    { key: 'coverImageUrl', label: 'Qapaq şəkli', type: 'image', required: true, hint: 'https://… və ya /media/…' },
    {
      key: 'sections',
      label: 'Məqalə mətni',
      type: 'items',
      itemLabel: 'Bölmə',
      max: 20,
      hint: 'Hər bölmənin başlığı (istəyə görə), paraqrafları və şəkli ola bilər. Boş bölmələr saxlanmır.',
      newItem: newSection,
      fields: [
        { key: 'heading', label: 'Başlıq', maxLength: 200, wide: true },
        { key: 'paragraphs', label: 'Paraqraflar', type: 'strings', multiline: true, itemLabel: 'Paraqraf', max: 12 },
        { key: 'imageUrl', label: 'Şəkil', type: 'image' },
        { key: 'imageAlt', label: 'Şəklin təsviri (alt)', maxLength: 200, wide: true },
      ],
    },
    { key: 'sortOrder', label: 'Sıra', type: 'number', max: 10000, step: 10, hint: 'Kiçik rəqəm əvvəl gəlir.' },
    { key: 'isPublished', label: 'Saytda dərc et', type: 'toggle', hint: 'Söndürülsə, məqalə saytda görünmür.' },
  ],
}

/** /admin/jurnal — journal articles (GET/POST/PUT/DELETE /api/admin/journal-articles). */
export function AdminJournalPage() {
  return <CollectionPage config={config} />
}
