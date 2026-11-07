// UTILS
import { formatAmount, getCurrencySymbol } from '@/shared/lib/currencies'
import { convert, type ExchangeRates } from '@/shared/lib/exchangeRates'

// TYPES
import type { CurrencyCode } from '@/shared/types'

/** How one charge's price shows in a list. */
export interface ShownPrice {
  amount: number
  currencySymbol: string
  /** What is really charged, when it was converted: "€ 240,00". */
  note?: string
}

/**
 * A charge's price in the picked currency, like Home's cards and the totals, with what is
 * really charged as a note. Without a rate it stays in its own currency, with no note.
 *
 * @example
 * chargeInCurrency({ price: 240, currency: 'EUR' }, 'USD', rates)
 * // { amount: 480, currencySymbol: 'U$S', note: '€ 240,00' }
 */
export function chargeInCurrency(
  charge: { price: number; currency: CurrencyCode },
  currency: CurrencyCode,
  rates: ExchangeRates | null,
): ShownPrice {
  const converted = convert(charge.price, charge.currency, currency, rates)
  if (converted === null || charge.currency === currency) {
    return { amount: charge.price, currencySymbol: getCurrencySymbol(charge.currency) }
  }
  return {
    amount: converted,
    currencySymbol: getCurrencySymbol(currency),
    note: `${getCurrencySymbol(charge.currency)} ${formatAmount(charge.price)}`,
  }
}
