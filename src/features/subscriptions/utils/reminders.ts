// UTILS
import { nextBillDate } from './billingCycle'
import { addDays } from '@/shared/lib/isoDate'

// TYPES
import type { Subscription } from '@/shared/types'

/** One notification to schedule: on which day, for which reminder, about which event. */
export interface ReminderTrigger {
  subscriptionId: string
  reminderId: string
  /**
   * What the notification talks about. `trial_end` when the charge is the one that ends the
   * free trial ("tu prueba termina en N días, después se cobran $X"), `billing` otherwise.
   * Worked out per charge: the user never picks it.
   */
  target: 'billing' | 'trial_end'
  /** `YYYY-MM-DD`, the day to notify (the time comes from Ajustes when scheduling). */
  date: string
  /** `YYYY-MM-DD`, the charge the notification is about. */
  eventDate: string
}

/**
 * Every notification a subscription needs between `today` and `until`, one per reminder and
 * charge: the charge day minus the reminder's `daysBefore`. Dates only, so it stays pure and
 * testable; the notifications code adds the time and schedules them.
 *
 * Nothing for a paused subscription, a one-time payment (it won't come back, there's nothing
 * to cancel) or a disabled reminder. Charges stop at `endDate`. `until` is the end of the
 * planning window: without it a subscription with no end would have charges forever.
 *
 * @param today `YYYY-MM-DD`, pass `todayISO()`. A notify day before it is skipped.
 * @param until `YYYY-MM-DD`, the last day to plan for (included).
 *
 * @example
 * // Monthly on the 15th, reminder 3 days before, planned from Oct 22 to Dec 21
 * getReminderTriggers(netflix, '2026-10-22', '2026-12-21')
 * // → notify Nov 12 (charge Nov 15) and Dec 12 (charge Dec 15)
 */
export function getReminderTriggers(
  sub: Subscription,
  today: string,
  until: string,
): ReminderTrigger[] {
  const triggerList: ReminderTrigger[] = []

  const subReminders = sub.reminders
  // Paused, or a one-time payment: no reminders
  if (sub.isPaused || sub.billingCycle.type === 'one-time') return triggerList

  subReminders.forEach((reminder) => {
    if (!reminder.isEnabled) return

    // Starts at the next charge on or after today; earlier ones would notify in the past
    let chargeDate = nextBillDate(sub.firstBillDate, sub.billingCycle, today)
    let notifyWhen = addDays(chargeDate, -reminder.daysBefore)

    // Stops when the notify day leaves the window or the subscription has ended
    while (notifyWhen <= until && (!sub.endDate || chargeDate <= sub.endDate)) {
      // A notify day that already passed is skipped, but the loop goes on to the next charge
      if (notifyWhen >= today) {
        const trigger: ReminderTrigger = {
          subscriptionId: sub.id,
          reminderId: reminder.id,
          // The form makes the trial end the first charge, so only that one matches
          target: sub.trial?.endDate === chargeDate ? 'trial_end' : 'billing',
          date: notifyWhen,
          eventDate: chargeDate,
        }
        triggerList.push(trigger)
      }
      // The charge after this one. `nextBillDate` counts from `firstBillDate`, so a Jan 31
      // subscription lands on each month's last day without drifting
      chargeDate = nextBillDate(
        sub.firstBillDate,
        sub.billingCycle,
        addDays(chargeDate, 1),
      )
      notifyWhen = addDays(chargeDate, -reminder.daysBefore)
    }
  })
  return triggerList
}

/** All the notifications that fall on one day. */
export interface ReminderDay {
  /** `YYYY-MM-DD` */
  date: string
  /** One or more: several subscriptions can notify on the same day. */
  triggers: ReminderTrigger[]
}

/**
 * Bundles triggers that fall on the same day, sorted by date, so the notifications can turn
 * three on one day into one summary ("3 subscripciones se cobran mañana").
 * Takes triggers from any number of subscriptions, in any order.
 *
 * @example
 * groupTriggersByDay([netflixNov17, spotifyNov12, disneyNov17])
 * // → [{ date: '2026-11-12', triggers: [spotify] },
 * //    { date: '2026-11-17', triggers: [netflix, disney] }]
 */
export function groupTriggersByDay(triggers: ReminderTrigger[]): ReminderDay[] {
  // date -> that day's triggers
  const byDate = new Map<string, ReminderTrigger[]>()

  triggers.forEach((trigger) => {
    const sameDay = byDate.get(trigger.date)
    if (sameDay) sameDay.push(trigger)
    else byDate.set(trigger.date, [trigger])
  })

  return [...byDate]
    .map(([date, dayTriggers]) => ({ date, triggers: dayTriggers }))
    .toSorted((a, b) => a.date.localeCompare(b.date))
}
