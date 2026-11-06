import {
  chargesBetween,
  type Charge,
} from '@/features/subscriptions/utils/subscriptionHistory'
import type { Subscription } from '@/shared/types'

/**
 * Every subscription's charges between `from` and `to` (both included), grouped by date:
 * one lookup the month grid builds once, so each tile just asks for its own day. Days with
 * no charges aren't in the map (ask `byDay.get(date) ?? []`). Within a day, paused charges
 * go last, so the logos a tile has room for go to real charges first.
 *
 * @param from `YYYY-MM-DD`, the grid's first day.
 * @param to `YYYY-MM-DD`, the grid's last day.
 * @example
 * // November 2026's grid runs Nov 1 to Dec 12
 * const byDay = chargesByDay(subscriptions, '2026-11-01', '2026-12-12')
 * byDay.get('2026-11-15') // [netflixCharge, spotifyCharge]
 */
export function chargesByDay(
  subs: Subscription[],
  from: string,
  to: string,
): Map<string, Charge[]> {
  const all = subs.flatMap((sub) => chargesBetween(sub, from, to))
  const byDay = new Map<string, Charge[]>()

  all.forEach((charge) => {
    const box = byDay.get(charge.date)
    if (box)
      box.push(charge) // there's a box: add this charge to it
    else byDay.set(charge.date, [charge])
  })

  for (const box of byDay.values()) {
    box.sort((a, b) => Number(a.isPaused) - Number(b.isPaused))
  }

  return byDay
}
