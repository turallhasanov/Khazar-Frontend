import { describe, expect, it } from 'vitest'
import { describeOrderError } from '../describeOrderError.js'

describe('describeOrderError', () => {
  it('shows the trace id for a server fault so it can be found in the API log', () => {
    const message = describeOrderError({ status: 500, problem: { traceId: '00-abc-01' } })
    expect(message).toBe('Sifariş yaradılmadı. Bir az sonra yenidən cəhd edin. (Xəta kodu: 00-abc-01)')
  })

  it('stays generic for a server fault without a problem body', () => {
    expect(describeOrderError({ status: 502, problem: null })).toBe('Sifariş yaradılmadı. Bir az sonra yenidən cəhd edin.')
  })

  it('adds the server reason to validation, missing-product and stock errors', () => {
    expect(describeOrderError({ status: 400, problem: { detail: 'Phone is too long.' } })).toContain('(Phone is too long.)')
    expect(describeOrderError({ status: 404, problem: { detail: 'Product x not found.' } })).toContain('(Product x not found.)')
    expect(describeOrderError({ status: 409, problem: { detail: 'Not enough stock: SKU-1' } })).toContain('(Not enough stock: SKU-1)')
  })

  it('keeps the plain sentence when the server gives no reason', () => {
    expect(describeOrderError({ status: 400, problem: null })).toBe('Sifariş məlumatlarında xəta var. Formu yoxlayıb yenidən cəhd edin.')
  })

  it('reports an unreachable server', () => {
    expect(describeOrderError({ status: 0 })).toContain('Serverə qoşulmaq mümkün olmadı')
  })
})
