// UTILS
import { daysBetween } from '@/shared/lib/isoDate'
import { addCycles } from './billingCycle'
import { nextScheduledCharge, upcomingCycle } from './schedule'
import { nextCharge } from './subscriptionHistory'

// TYPES
import type { BillingCycle, Schedule, Subscription } from '@/shared/types'

/** Whether two billing cycles are the same rhythm (same type, interval and unit). */
export function sameCycle(a: BillingCycle, b: BillingCycle): boolean {
  if (a.type === 'one-time' || b.type === 'one-time') return a.type === b.type
  return a.interval === b.interval && a.unit === b.unit
}

/**
 * What the edit form shows as the date and the cycle of a saved subscription, and so what
 * an edit is compared against.
 * - `next`: the next charge and its cycle. A new date or cycle there asks "¿Desde cuándo?".
 * - `first`: the first charge. Used with a free trial (its start shapes the first charge, so
 *   editing it rewrites the start) and for an ended subscription (it has no next charge).
 *
 * @param today `YYYY-MM-DD`, pass `todayISO()`.
 */
export function editAnchor(
  sub: Pick<Subscription, 'schedule' | 'endDate' | 'trial'>,
  today: string,
): { kind: 'next' | 'first'; date: string; billingCycle: BillingCycle } {
  if (sub.trial || nextCharge(sub, today) === null) {
    const [first] = sub.schedule
    return { kind: 'first', date: first.from, billingCycle: first.billingCycle }
  }
  return {
    kind: 'next',
    date: nextScheduledCharge(sub.schedule, today),
    billingCycle: upcomingCycle(sub.schedule, today),
  }
}

/** What the user saved in the form: a charge day and a cycle. */
export interface ScheduleEdit {
  /** `YYYY-MM-DD`, the date in the form. */
  date: string
  billingCycle: BillingCycle
}

/**
 * Where an old charge lands with the new rhythm: the charge of the rhythm through
 * `edit.date` that is closest to it. What each row of the "¿Desde cuándo?" sheet shows
 * ("pasa al 14 Nov"), and where `applyScheduleEdit` starts the new rhythm.
 *
 * @param charge `YYYY-MM-DD`, an old charge.
 * @example
 * // Moved to the 14th, monthly: the Nov 10 charge lands on Nov 14
 * landsOn({ date: '2026-12-14', billingCycle: monthly }, '2026-11-10') // '2026-11-14'
 */
export function landsOn(edit: ScheduleEdit, charge: string): string {
  const { date, billingCycle } = edit
  if (billingCycle.type === 'one-time') return date

  const distance = (step: number) =>
    Math.abs(daysBetween(charge, addCycles(date, billingCycle, step)))
  // Step from `date` towards `charge` while it gets closer. Always counted from `date`
  // (not from the last step), so a month-end never drifts
  const direction = charge < date ? -1 : 1
  let step = 0
  while (distance(step + direction) < distance(step)) step += direction
  return addCycles(date, billingCycle, step)
}

/**
 * The schedule after the user saves a new charge day or cycle and answers "¿Desde cuándo?"
 * by picking the first charge that changes. That charge and the ones after it follow the new
 * rhythm (it lands where `landsOn` says); the ones before keep theirs. Picking the first
 * charge rewrites the whole history (a correction). Changes saved for later are replaced,
 * like `applyPriceEdit` does for prices.
 *
 * @param from `YYYY-MM-DD`, the picked charge: the next one, or a past one.
 * @example
 * // Monthly on the 10th since Oct 10. The Nov 10 charge really came on Nov 14
 * applyScheduleEdit(schedule, { date: '2026-12-14', billingCycle: monthly }, '2026-11-10')
 * // [{ from: '2026-10-10', ... }, { from: '2026-11-14', since: '2026-11-10', ... }]
 */
export function applyScheduleEdit(
  schedule: Schedule,
  edit: ScheduleEdit,
  from: string,
): Schedule {
  const { billingCycle } = edit
  const firstNew = landsOn(edit, from)
  // The new rhythm takes over on the picked charge, or earlier if it lands before it
  const since = firstNew < from ? firstNew : from

  const kept = schedule.filter((entry) => (entry.since ?? entry.from) < since)
  // Nothing before it: the first charge itself changed, so it's one rhythm from the start
  if (kept.length === 0) return [{ from: firstNew, billingCycle }]
  const [first, ...rest] = kept
  return [
    first,
    ...rest,
    since === firstNew
      ? { from: firstNew, billingCycle }
      : { from: firstNew, billingCycle, since },
  ]
}
