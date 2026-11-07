// UTILS
import { addDays } from '@/shared/lib/isoDate'
import { addCycles, nextBillDate } from './billingCycle'

// TYPES
import type {
  BillingCycle,
  CurrencyCode,
  Pause,
  PriceChange,
  PriceHistory,
  Subscription,
} from '@/shared/types'

/**
 * The price in force on `date`: the last change that started on or before it. A date
 * before the first change gets the first price. Pure: pass `todayISO()` for "now".
 *
 * @param date `YYYY-MM-DD`; ISO dates compare correctly as text.
 * @example
 * // 9.99 from Jan 10, 12.99 from Jun 10
 * priceOn(history, '2026-03-10') // { from: '2026-01-10', price: 9.99, ... }
 * priceOn(history, '2026-06-10') // { from: '2026-06-10', price: 12.99, ... }
 */
export function priceOn(history: PriceHistory, date: string): PriceChange {
  let current = history[0]
  for (const change of history) {
    if (change.from > date) break // oldest first: every later one starts later too
    current = change
  }
  return current
}

/**
 * Whether a subscription is paused on `date`: inside a pause, from its first day up to
 * (not including) the day it was resumed. Pure: pass `todayISO()` for "now".
 *
 * @param date `YYYY-MM-DD`
 */
export function isPausedOn(pauses: Pause[], date: string): boolean {
  return pauses.some((pause) => pause.from <= date && (!pause.to || date < pause.to))
}

/**
 * The history after the user saves a price (and currency) in the form. Nothing changes if
 * it's the price already in force on `from`. Otherwise the new price starts on `from`, and
 * any change planned on or after that day is replaced. With no charge before `from` (the
 * first charge hasn't happened), the history is just the new price.
 *
 * @param from `YYYY-MM-DD`, a charge day: the next charge, or one the user picks.
 * @example
 * // 11.300 from Sep 5, then the user saves 11.768 with the next charge on Nov 5
 * applyPriceEdit(history, { from: '2026-11-05', price: 11768, currency: 'ARS' }, '2026-09-05')
 * // [{ from: '2026-09-05', price: 11300, ... }, { from: '2026-11-05', price: 11768, ... }]
 */
export function applyPriceEdit(
  history: PriceHistory,
  change: PriceChange,
  firstBillDate: string,
): PriceHistory {
  if (change.from <= firstBillDate) return [{ ...change, from: firstBillDate }]

  const inForce = priceOn(history, change.from)
  if (inForce.price === change.price && inForce.currency === change.currency)
    return history

  // The first price always stays, starting on the first charge (it covers the charges
  // before the change), so the result is never empty; later ones only if they start
  // before the change
  const [first, ...rest] = history
  return [
    { ...first, from: firstBillDate },
    ...rest.filter((entry) => entry.from < change.from),
    change,
  ]
}

/** The pauses after the user taps "Pausar" on `today`: a new open pause. */
export function startPause(pauses: Pause[], today: string): Pause[] {
  return [...pauses, { from: today }]
}

/**
 * The pauses after the user taps "Reanudar" on `today`: the open pause ends today. If no
 * charge fell inside it (paused and resumed between two charges, or the same day), it
 * changed nothing, so it isn't kept.
 */
export function endPause(
  pauses: Pause[],
  today: string,
  schedule: { firstBillDate: string; billingCycle: BillingCycle },
): Pause[] {
  return pauses.flatMap((pause) => {
    if (pause.to) return [pause]
    const firstCharge = nextBillDate(
      schedule.firstBillDate,
      schedule.billingCycle,
      pause.from,
    )
    const skippedACharge = firstCharge < today
    return skippedACharge ? [{ from: pause.from, to: today }] : []
  })
}

/**
 * The price of the next charge on or after `today`: what the card, the form, the total
 * and the sorts show. A change saved for the next charge shows up right away, instead of
 * waiting for that day. Pure: pass `todayISO()`.
 */
export function upcomingPrice(
  sub: { priceHistory: PriceHistory; firstBillDate: string; billingCycle: BillingCycle },
  today: string,
): PriceChange {
  return priceOn(
    sub.priceHistory,
    nextBillDate(sub.firstBillDate, sub.billingCycle, today),
  )
}

/**
 * The next charge on or after `today`, or `null` when there is none left: the end date
 * comes before it. The one place that knows about `endDate`, so the card, the total, the
 * sorts and the status all agree. Pure: pass `todayISO()`.
 *
 * @example
 * // Monthly on the 5th, ending Nov 20
 * nextCharge(claro, '2026-11-03') // '2026-11-05'
 * nextCharge(claro, '2026-11-06') // null: Dec 5 is after the end
 */
export function nextCharge(
  sub: { firstBillDate: string; billingCycle: BillingCycle; endDate?: string },
  today: string,
): string | null {
  const date = nextBillDate(sub.firstBillDate, sub.billingCycle, today)
  return sub.endDate && date > sub.endDate ? null : date
}

/**
 * The charges that already happened (before `today`), newest first, at most `limit`: the
 * days a price change can start on besides the next charge ("¿Desde cuándo?" sheet).
 *
 * @example
 * // Monthly on the 5th since Sep 5, today Nov 3
 * pastCharges(claro, '2026-11-03') // ['2026-10-05', '2026-09-05']
 */
export function pastCharges(
  sub: { firstBillDate: string; billingCycle: BillingCycle },
  today: string,
  limit = 12,
): string[] {
  if (sub.billingCycle.type === 'one-time') {
    return sub.firstBillDate < today ? [sub.firstBillDate] : []
  }
  const dates: string[] = []
  for (let count = 0; ; count++) {
    const date = addCycles(sub.firstBillDate, sub.billingCycle, count)
    if (date >= today) break
    dates.push(date)
  }
  return dates.reverse().slice(0, limit)
}

/** One charge of one subscription on one day: what the Calendario grid, the day list and the month total read. */
export interface Charge {
  subscriptionId: string
  /** `YYYY-MM-DD`, the day it's charged. */
  date: string
  /** The price in force on `date` (a price change shows up from its day on), in `currency`. */
  price: number
  currency: CurrencyCode
  /** Inside a pause: it won't be charged, shown greyed as "pausada". Kept on purpose, unlike reminders. */
  isPaused: boolean
  /** The charge that ends the free trial: the first one the user really pays. */
  isTrialEnd: boolean
}

/**
 * Every charge of a subscription between `from` and `to` (both included), oldest first.
 * Jumps from charge to charge with `nextBillDate`, so it never drifts (a Jan 31 sub lands on
 * each month's last day). Nothing after `endDate`. Paused charges stay in, flagged
 * `isPaused`. A one-time payment gives none: the calendar doesn't show them, and
 * `nextBillDate` never moves for one, so the loop would never end. Pure.
 *
 * @param from `YYYY-MM-DD`, e.g. the first day of the month grid.
 * @param to `YYYY-MM-DD`, e.g. the last day of the month grid.
 * @example
 * // Monthly on the 15th, the November grid (Nov 1 to Dec 12)
 * chargesBetween(netflix, '2026-11-01', '2026-12-12') // [{ date: '2026-11-15', ... }]
 */
export function chargesBetween(
  sub: Pick<
    Subscription,
    | 'id'
    | 'priceHistory'
    | 'billingCycle'
    | 'firstBillDate'
    | 'endDate'
    | 'trial'
    | 'pauses'
  >,
  from: string,
  to: string,
): Charge[] {
  const charges: Charge[] = []
  /* One-Time Payments that shouldn't be shown */
  if (sub.billingCycle.type === 'one-time') {
    return charges
  }

  let date = nextBillDate(sub.firstBillDate, sub.billingCycle, from)

  while (date <= to && (!sub.endDate || date <= sub.endDate)) {
    const { price, currency } = priceOn(sub.priceHistory, date)
    const charge: Charge = {
      subscriptionId: sub.id,
      date: date,
      price: price,
      currency: currency,
      isPaused: isPausedOn(sub.pauses, date),
      isTrialEnd: sub.trial?.endDate === date,
    }
    charges.push(charge)
    date = nextBillDate(sub.firstBillDate, sub.billingCycle, addDays(date, 1))
  }
  return charges
}
