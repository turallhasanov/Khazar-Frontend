import { HelpCircle } from 'lucide-react'
import { CollectionPage } from '../components/admin/content/CollectionPage.jsx'
import { faqItemsApi } from '../services/adminService.js'

const config = {
  eyebrow: 'Məzmun',
  title: 'FAQ',
  description:
    '«Tez-tez verilən suallar» səhifəsinin sual-cavabları. Yalnız dərc olunanlar saytda görünür, kiçik sıra nömrəsi əvvəl gəlir.',
  icon: HelpCircle,
  noun: 'sual',
  api: faqItemsApi,
  emptyItem: (sortOrder) => ({ question: '', answer: '', sortOrder, isPublished: true }),
  toForm: (item) => ({ question: item.question, answer: item.answer, sortOrder: item.sortOrder, isPublished: item.isPublished }),
  itemTitle: (item) => item.question,
  itemSubtitle: (item) => item.answer,
  previewPath: () => '/tez-tez-verilen-suallar',
  fields: [
    { key: 'question', label: 'Sual', required: true, maxLength: 300, wide: true },
    { key: 'answer', label: 'Cavab', type: 'textarea', rows: 6, required: true, maxLength: 3000 },
    { key: 'sortOrder', label: 'Sıra', type: 'number', max: 10000, step: 10, hint: 'Kiçik rəqəm əvvəl gəlir.' },
    { key: 'isPublished', label: 'Saytda dərc et', type: 'toggle', hint: 'Söndürülsə, sual saytda görünmür.' },
  ],
}

/** /admin/faq — FAQ items (GET/POST/PUT/DELETE /api/admin/faq-items). */
export function AdminFaqPage() {
  return <CollectionPage config={config} />
}
