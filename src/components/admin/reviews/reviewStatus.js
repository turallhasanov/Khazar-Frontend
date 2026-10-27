import { Check, RotateCcw, X } from 'lucide-react'

/** Moderation states as the admin sees them; `hint` tells what the state means on the storefront. */
export const REVIEW_STATUS = {
  Pending: {
    label: 'Gözləyir',
    hint: 'Moderasiya gözləyir — saytda görünmür.',
    badge: 'border-clay-500/40 bg-clay-50 text-clay-700',
    dot: 'bg-clay-500',
  },
  Approved: {
    label: 'Dərc olunub',
    hint: 'Məhsul səhifəsində görünür.',
    badge: 'border-sage-600/40 bg-sage-100 text-sage-700',
    dot: 'bg-sage-600',
  },
  Rejected: {
    label: 'Rədd edilib',
    hint: 'Gizlədilib — saytda görünmür.',
    badge: 'border-ink-900/15 bg-linen-100 text-ink-500',
    dot: 'bg-ink-400',
  },
}

/** The status changes offered for a review: every state except the current one. */
export const STATUS_ACTIONS = [
  { status: 'Approved', label: 'Təsdiqlə', icon: Check, variant: 'approve' },
  { status: 'Rejected', label: 'Rədd et', icon: X, variant: 'reject' },
  { status: 'Pending', label: 'Gözləməyə qaytar', icon: RotateCcw, variant: 'secondary' },
]
