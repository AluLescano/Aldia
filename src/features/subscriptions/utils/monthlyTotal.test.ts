import { describe, expect, it } from 'vitest'

import { getMonthlyTotal, monthlyEquivalent } from './monthlyTotal'
import type { ExchangeRates } from '@/shared/lib/exchangeRates'
import type { BillingCycle, BillingUnit, Subscription } from '@/shared/types'

const every = (interval: number, unit: BillingUnit): BillingCycle => ({
  type: 'every',
  interval,
  unit,
})

// Only the fields the total reads; the rest does not matter here
const sub = (
  price: number,
  currency: string,
  billingCycle: BillingCycle,
  status: Subscription['status'] = 'active',
) => ({ price, currency, billingCycle, status }) as Subscription

const rates: ExchangeRates = {
  date: '2026-10-16',
  rates: { USD: 1, ARS: 1500, EUR: 0.9 },
}

describe('monthlyEquivalent', () => {
  it.each([
    [120, every(1, 'year'), 10],
    [30, every(2, 'month'), 15],
    [10, every(1, 'week'), 43.333],
    [1, every(1, 'day'), 30.417],
    [50, { type: 'one-time' } as BillingCycle, 0],
  ])('%d per %o is %d a month', (price, cycle, expected) => {
    expect(monthlyEquivalent(price, cycle)).toBeCloseTo(expected, 2)
  })
})

describe('getMonthlyTotal', () => {
  const list = [
    sub(120, 'USD', every(1, 'year')), // 10 USD a month
    sub(3000, 'ARS', every(1, 'month')), // 2 USD a month at 1500
    sub(99, 'USD', every(1, 'month'), 'inactive'), // paused: not counted
    sub(10, 'USD', every(1, 'month'), 'trial'), // still free: not counted
    sub(5, 'XXX', every(1, 'month')), // unknown currency: left out, and counted as such
  ]

  it('adds the active ones in the chosen currency', () => {
    const result = getMonthlyTotal(list, 'USD', rates)
    expect(result.total).toBeCloseTo(12)
    expect(result).toMatchObject({ converted: 1, unconverted: 1 })
  })

  it('converts into another currency', () => {
    expect(getMonthlyTotal(list, 'ARS', rates).total).toBeCloseTo(18000)
  })

  it('still adds the same currency without rates', () => {
    expect(getMonthlyTotal(list, 'USD', null)).toEqual({
      total: 10,
      converted: 0,
      unconverted: 2,
    })
  })

  it('is 0 for an empty list', () => {
    expect(getMonthlyTotal([], 'USD', rates).total).toBe(0)
  })
})
