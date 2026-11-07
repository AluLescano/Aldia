// UTILS
import { convert, type ExchangeRates } from '@/shared/lib/exchangeRates'

// TYPES
import type { Charge } from '@/features/subscriptions/utils/subscriptionHistory'
import type { CurrencyCode } from '@/shared/types'

/** The result of `chargesTotal`. */
export interface ChargesTotal {
  /** What the paying charges add up to, in the requested currency. */
  total: number
  /** Paying charges that made it into the total (paused ones never count). */
  count: number
  /** Charges in another currency that needed a conversion and got one. */
  converted: number
  /** Charges left out because a rate was missing. */
  unconverted: number
}

/**
 * What some charges really cost, in one currency: the Calendario's month total and the
 * day sheet's "Total del día". Unlike Home's monthly average, a yearly charge counts whole
 * on its day. Paused charges are skipped (nothing is paid). Pure: give it the rates.
 *
 * @example
 * chargesTotal(byDay.get('2026-11-15') ?? [], 'USD', rates)
 * // { total: 30, count: 3, converted: 0, unconverted: 0 }
 */
export function chargesTotal(
  charges: Charge[],
  currency: CurrencyCode,
  rates: ExchangeRates | null,
): ChargesTotal {
  const result: ChargesTotal = { total: 0, count: 0, converted: 0, unconverted: 0 }

  for (const charge of charges) {
    if (charge.isPaused) continue

    const amount = convert(charge.price, charge.currency, currency, rates)
    if (amount === null) {
      result.unconverted += 1
      continue
    }

    result.total += amount
    result.count += 1
    if (charge.currency !== currency) result.converted += 1
  }

  return result
}
