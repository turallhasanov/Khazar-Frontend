import { describe, expect, it } from 'vitest'
import { formatOrderDate, orderStatusView } from '../orderStatus.js'

describe('orderStatusView', () => {
  it('maps completed to green, pending to yellow and cancelled to red', () => {
    expect(orderStatusView('Completed')).toEqual({ label: 'Tamamlandı', tone: 'green' })
    expect(orderStatusView('Pending')).toEqual({ label: 'Gözləmədə', tone: 'yellow' })
    expect(orderStatusView('Cancelled')).toEqual({ label: 'Ləğv edildi', tone: 'red' })
  })

  it('keeps an unknown status readable instead of throwing', () => {
    expect(orderStatusView('Shipped')).toEqual({ label: 'Shipped', tone: 'yellow' })
    expect(orderStatusView(undefined).label).toBe('—')
  })
})

describe('formatOrderDate', () => {
  it('reads a zone-less API timestamp as UTC and tolerates a missing value', () => {
    expect(formatOrderDate('2026-11-04T10:00:00')).toContain('2026')
    expect(formatOrderDate('')).toBe('')
  })
})
