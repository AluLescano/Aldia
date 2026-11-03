// UTILS
import { convert, type ExchangeRates } from '@/shared/lib/exchangeRates'
import { statusFor } from './subscriptionStatus'

// TYPES
import type {
  BillingCycle,
  BillingUnit,
  CurrencyCode,
  Subscription,
} from '@/shared/types'

// How many months one unit lasts
const MONTHS_PER_UNIT: Record<BillingUnit, number> = {
  day: 12 / 365,
  week: 12 / 52,
  month: 1,
  year: 12,
}

/**
 * What a price costs per month, spread over its billing cycle. A one-time payment is 0:
 * it is not a monthly expense.
 *
 * @example
 * monthlyEquivalent(120, { type: 'every', interval: 1, unit: 'year' })  // 10
 * monthlyEquivalent(30, { type: 'every', interval: 2, unit: 'month' })  // 15
 * monthlyEquivalent(10, { type: 'every', interval: 1, unit: 'week' })   // 43.33
 */
export function monthlyEquivalent(price: number, cycle: BillingCycle): number {
  if (cycle.type === 'one-time') return 0
  return price / (cycle.interval * MONTHS_PER_UNIT[cycle.unit])
}

/**
 * What a subscription costs per month in `currency`: the number the Home total adds up,
 * the price sorts compare and the cards show. `null` when a rate is missing.
 */
export function monthlyPriceIn(
  sub: Pick<Subscription, 'price' | 'currency' | 'billingCycle'>,
  currency: CurrencyCode,
  rates: ExchangeRates | null,
): number | null {
  return convert(
    monthlyEquivalent(sub.price, sub.billingCycle),
    sub.currency,
    currency,
    rates,
  )
}

/** The result of `getMonthlyTotal`. */
export interface MonthlyTotal {
  /** Monthly cost of the active subscriptions, in the requested currency. */
  total: number
  /** Active subscriptions that needed a conversion and got one. */
  converted: number
  /** Active subscriptions left out because a rate was missing. */
  unconverted: number
}

/**
 * Monthly cost of the ACTIVE subscriptions (paused and trial ones are not paying),
 * converted to one currency. Pure: give it the rates and `todayISO()`, it never fetches them.
 */
export function getMonthlyTotal(
  subscriptions: Subscription[],
  currency: CurrencyCode,
  rates: ExchangeRates | null,
  today: string,
): MonthlyTotal {
  const result: MonthlyTotal = { total: 0, converted: 0, unconverted: 0 }

  for (const sub of subscriptions) {
    if (statusFor(sub, today) !== 'active') continue
    const amount = monthlyPriceIn(sub, currency, rates)
    if (amount === null) {
      result.unconverted++
      continue
    }
    result.total += amount
    if (sub.currency !== currency) result.converted++
  }

  return result
}
