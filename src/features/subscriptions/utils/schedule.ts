// UTILS
import { nextBillDate } from './billingCycle'

// TYPES
import type { Schedule, ScheduleChange } from '@/shared/types'

/**
 * The schedule entry in force on `date`: the last one that started on or before it. A
 * date before the first entry gets the first one. Same shape as `priceOn`. Pure: pass
 * `todayISO()` for "now".
 *
 * @param date `YYYY-MM-DD`; ISO dates compare correctly as text.
 * @example
 * // monthly from Jan 10, yearly from Jun 10
 * cycleOn(schedule, '2026-06-09').billingCycle // monthly
 * cycleOn(schedule, '2026-06-10').billingCycle // yearly
 */
export function cycleOn(schedule: Schedule, date: string): ScheduleChange {
  let current = schedule[0]
  for (const change of schedule) {
    if (change.from > date) break // oldest first: every later one starts later too
    current = change
  }
  return current
}

/**
 * The next charge on or after `today`, following a schedule that can change. Each entry
 * only owns its charges before the next entry starts: if its next charge would land on
 * or after the switch, the next entry is asked instead. A one-time entry that already
 * happened is skipped too, unless it's the last one (then its past date comes back, as
 * with `nextBillDate`, so `statusFor` can call it ended). Pure: pass `todayISO()` for "now".
 *
 * @param today `YYYY-MM-DD`
 * @returns `YYYY-MM-DD`
 * @example
 * // charged monthly on Oct 10, then the charge day moved to Nov 14
 * nextScheduledCharge(schedule, '2026-11-18') // '2026-12-14'
 */
export function nextScheduledCharge(schedule: Schedule, today: string): string {
  for (let i = 0; i < schedule.length; i++) {
    const entry = schedule[i]
    const nextEntry = schedule[i + 1]
    const date = nextBillDate(entry.from, entry.billingCycle, today)
    if (!nextEntry || (date < nextEntry.from && date >= today)) return date
  }

  // Never reached (the last entry always returns above), but TypeScript can't tell
  const last = schedule[schedule.length - 1]
  return nextBillDate(last.from, last.billingCycle, today)
}
