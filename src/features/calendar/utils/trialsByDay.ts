// UTILS
import { addDays } from '@/shared/lib/isoDate'

// TYPES
import type { Subscription } from '@/shared/types'

/**
 * Which subscriptions are on a free trial each day between `from` and `to` (both included):
 * the grid tints those days and the day sheet lists them. A trial covers its start day to its
 * end day, both included: the end is the day the first charge lands, still shown as part of
 * the trial on the tile. Days with no trial aren't in the map (ask `trials.get(date) ?? []`).
 *
 * @param from `YYYY-MM-DD`, the grid's first day.
 * @param to `YYYY-MM-DD`, the grid's last day.
 * @example
 * // Disney+ free from Nov 8 to Nov 15
 * trialsByDay(subscriptions, '2026-11-01', '2026-12-12').get('2026-11-10') // [disney]
 */
export function trialsByDay(
  subs: Subscription[],
  from: string,
  to: string,
): Map<string, Subscription[]> {
  const byDay = new Map<string, Subscription[]>()

  for (const sub of subs) {
    if (!sub.trial) continue
    // Only the part of the trial the range shows. YYYY-MM-DD strings compare like dates
    const first = sub.trial.startDate > from ? sub.trial.startDate : from
    const last = sub.trial.endDate < to ? sub.trial.endDate : to

    // A trial outside the range has first > last, so the loop never runs
    for (let day = first; day <= last; day = addDays(day, 1)) {
      const box = byDay.get(day)
      if (box) box.push(sub)
      else byDay.set(day, [sub])
    }
  }

  return byDay
}
