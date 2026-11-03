import { describe, expect, it } from 'vitest'

import { isPausedOn, priceOn } from './subscriptionHistory'
import type { Pause, PriceHistory } from '@/shared/types'

describe('priceOn', () => {
  const history: PriceHistory = [
    { from: '2026-01-10', price: 9.99, currency: 'USD' },
    { from: '2026-06-10', price: 12.99, currency: 'USD' },
    { from: '2026-09-10', price: 15000, currency: 'ARS' }, // moved to pesos
  ]

  it.each([
    ['2026-01-10', 9.99], // the first day of the first price
    ['2026-03-10', 9.99],
    ['2026-06-09', 9.99], // the day before a change still has the old price
    ['2026-06-10', 12.99], // a change applies from its own day
    ['2026-08-31', 12.99],
    ['2026-12-10', 15000],
  ])('on %s the price is %d', (date, price) => {
    expect(priceOn(history, date).price).toBe(price)
  })

  it('keeps the currency of each change', () => {
    expect(priceOn(history, '2026-10-10').currency).toBe('ARS')
  })

  it('before the first change, uses the first price', () => {
    expect(priceOn(history, '2025-12-31').price).toBe(9.99)
  })

  it('works with a single price', () => {
    expect(
      priceOn([{ from: '2026-01-10', price: 5, currency: 'USD' }], '2027-01-01').price,
    ).toBe(5)
  })
})

describe('isPausedOn', () => {
  const pauses: Pause[] = [
    { from: '2026-03-08', to: '2026-03-12' }, // paused 4 days in March
    { from: '2026-10-01' }, // paused since Oct 1, not resumed
  ]

  it.each([
    ['2026-03-07', false], // the day before
    ['2026-03-08', true], // the day it was paused
    ['2026-03-11', true],
    ['2026-03-12', false], // the day it was resumed: charges happen again
    ['2026-09-30', false],
    ['2026-10-01', true], // still paused, with no end
    ['2027-05-20', true],
  ])('on %s paused is %s', (date, expected) => {
    expect(isPausedOn(pauses, date)).toBe(expected)
  })

  it('is never paused without pauses', () => {
    expect(isPausedOn([], '2026-03-10')).toBe(false)
  })
})
