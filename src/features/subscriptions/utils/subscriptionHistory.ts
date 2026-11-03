// TYPES
import type { Pause, PriceChange, PriceHistory } from '@/shared/types'

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
