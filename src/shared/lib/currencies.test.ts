import { describe, expect, it } from 'vitest'

import { formatAmount, getCurrencySymbol } from './currencies'
import { convert, type ExchangeRates } from './exchangeRates'

const rates: ExchangeRates = {
  date: '2026-10-16',
  rates: { USD: 1, ARS: 1500, EUR: 0.9 },
}

describe('formatAmount', () => {
  it.each([
    [15130.689, '15.130,69'],
    [10, '10,00'],
    [1500000, '1.500.000,00'],
    [0, '0,00'],
  ])('%d → %s', (amount, expected) => {
    expect(formatAmount(amount)).toBe(expected)
  })
})

describe('getCurrencySymbol', () => {
  it('knows the default currencies', () => {
    expect(getCurrencySymbol('USD')).toBe('U$S')
    expect(getCurrencySymbol('ARS')).toBe('$')
  })

  it('falls back to the code', () => {
    expect(getCurrencySymbol('BRL')).toBe('BRL')
  })
})

describe('convert', () => {
  it('goes through the dollar', () => {
    expect(convert(10, 'USD', 'ARS', rates)).toBe(15000)
    expect(convert(1500, 'ARS', 'USD', rates)).toBe(1)
    expect(convert(9, 'EUR', 'USD', rates)).toBeCloseTo(10)
  })

  it('needs no rates for the same currency', () => {
    expect(convert(7, 'EUR', 'EUR', null)).toBe(7)
  })

  it('returns null instead of guessing', () => {
    expect(convert(7, 'USD', 'ARS', null)).toBeNull()
    expect(convert(7, 'XXX', 'USD', rates)).toBeNull()
  })
})
