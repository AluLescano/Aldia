import { describe, expect, it } from 'vitest'

import { chargesTotal } from './chargesTotal'
import type { Charge } from '@/features/subscriptions/utils/subscriptionHistory'
import type { ExchangeRates } from '@/shared/lib/exchangeRates'

// Units per 1 USD, like the real API
const rates: ExchangeRates = {
  date: '2026-11-07',
  rates: { USD: 1, ARS: 1500, EUR: 0.5 },
}

const charge = (
  price: number,
  currency: string,
  extra: Partial<Charge> = {},
): Charge => ({
  subscriptionId: `${price}-${currency}`,
  date: '2026-11-15',
  price,
  currency,
  isPaused: false,
  isTrialEnd: false,
  ...extra,
})

describe('chargesTotal', () => {
  it('adds charges in the same currency, no rates needed', () => {
    expect(chargesTotal([charge(10, 'USD'), charge(5.5, 'USD')], 'USD', null)).toEqual({
      total: 15.5,
      count: 2,
      converted: 0,
      unconverted: 0,
    })
  })

  it('converts the other currencies and counts them', () => {
    // 10 USD + 1500 ARS (1 USD) + 5 EUR (10 USD) = 21 USD
    const result = chargesTotal(
      [charge(10, 'USD'), charge(1500, 'ARS'), charge(5, 'EUR')],
      'USD',
      rates,
    )
    expect(result.total).toBeCloseTo(21)
    expect(result).toMatchObject({ count: 3, converted: 2, unconverted: 0 })
  })

  it('skips paused charges: nothing is paid', () => {
    const result = chargesTotal(
      [charge(10, 'USD'), charge(99, 'USD', { isPaused: true })],
      'USD',
      rates,
    )
    expect(result).toEqual({ total: 10, count: 1, converted: 0, unconverted: 0 })
  })

  it('leaves out and counts the charges with a missing rate', () => {
    const result = chargesTotal(
      [charge(10, 'USD'), charge(20, 'BRL'), charge(1500, 'ARS')],
      'USD',
      rates,
    )
    expect(result.total).toBeCloseTo(11)
    expect(result).toMatchObject({ count: 2, converted: 1, unconverted: 1 })
  })

  it('without rates, only the charges already in the currency count', () => {
    expect(chargesTotal([charge(10, 'USD'), charge(5, 'EUR')], 'USD', null)).toEqual({
      total: 10,
      count: 1,
      converted: 0,
      unconverted: 1,
    })
  })

  it('is zero for no charges', () => {
    expect(chargesTotal([], 'ARS', rates)).toEqual({
      total: 0,
      count: 0,
      converted: 0,
      unconverted: 0,
    })
  })
})
