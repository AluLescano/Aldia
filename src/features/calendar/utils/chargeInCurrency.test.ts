import { describe, expect, it } from 'vitest'

import { chargeInCurrency } from './chargeInCurrency'
import { formatAmount, getCurrencySymbol } from '@/shared/lib/currencies'
import type { ExchangeRates } from '@/shared/lib/exchangeRates'

const rates: ExchangeRates = {
  date: '2026-11-07',
  rates: { USD: 1, EUR: 0.5, ARS: 1500 },
}

describe('chargeInCurrency', () => {
  it('converts to the picked currency and notes what is really charged', () => {
    expect(chargeInCurrency({ price: 240, currency: 'EUR' }, 'USD', rates)).toEqual({
      amount: 480,
      currencySymbol: getCurrencySymbol('USD'),
      note: `${getCurrencySymbol('EUR')} ${formatAmount(240)}`,
    })
  })

  it('needs no note when it is already in that currency', () => {
    expect(chargeInCurrency({ price: 10, currency: 'USD' }, 'USD', rates)).toEqual({
      amount: 10,
      currencySymbol: getCurrencySymbol('USD'),
    })
  })

  it('stays in its own currency when a rate is missing', () => {
    expect(chargeInCurrency({ price: 7, currency: 'XYZ' }, 'USD', rates)).toEqual({
      amount: 7,
      currencySymbol: getCurrencySymbol('XYZ'),
    })
    expect(chargeInCurrency({ price: 5, currency: 'EUR' }, 'ARS', null)).toEqual({
      amount: 5,
      currencySymbol: getCurrencySymbol('EUR'),
    })
  })
})
