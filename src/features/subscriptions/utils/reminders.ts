// UTILS
import { addCycles, nextBillDate } from './billingCycle'
import { addDays } from '@/shared/lib/isoDate'

// TYPES
import type { BillingCycle, Subscription, SubscriptionReminder } from '@/shared/types'

/** Never more than this many days before a charge, even for long cycles. */
const MAX_DAYS_BEFORE = 30

/** How many reminders one subscription can have. */
export const MAX_REMINDERS = 3

// The shortest a cycle can be, in days (a month can be 28, a year 365)
const UNIT_DAYS = { day: 1, week: 7, month: 28, year: 365 }

/**
 * The most days before a charge a reminder can be set to: under one full cycle (or it would
 * land before the previous charge) and never more than 30. A daily charge only allows the
 * same day; a one-time payment gets no reminders, so it has no limit of its own.
 *
 * @example
 * maxDaysBefore({ type: 'every', interval: 1, unit: 'week' }) // 6
 * maxDaysBefore({ type: 'every', interval: 1, unit: 'year' }) // 30
 */
export function maxDaysBefore(cycle: BillingCycle) {
  if (cycle.type === 'one-time') return MAX_DAYS_BEFORE
  return Math.min(MAX_DAYS_BEFORE, cycle.interval * UNIT_DAYS[cycle.unit] - 1)
}

/**
 * Whether one more reminder fits: under `MAX_REMINDERS`, and with a free day left (each
 * reminder takes its own day from 0 to `maxDaysBefore`, so a daily charge fits only one).
 */
export function canAddReminder(reminders: SubscriptionReminder[], cycle: BillingCycle) {
  return reminders.length < Math.min(MAX_REMINDERS, maxDaysBefore(cycle) + 1)
}

/**
 * The day a new reminder takes: the first free one of 1, 2, 3… before the charge, and the
 * same day (0) last. Two reminders on one day would just ring twice. `undefined` if none is
 * free (check `canAddReminder` first).
 */
export function nextFreeDaysBefore(
  reminders: SubscriptionReminder[],
  cycle: BillingCycle,
) {
  const taken = reminders.map((reminder) => reminder.daysBefore)
  const candidates = [...Array.from({ length: maxDaysBefore(cycle) }, (_, i) => i + 1), 0]
  return candidates.find((days) => !taken.includes(days))
}

/** The parts of a subscription that decide when its charges, and so its reminders, fall. */
export type ChargeSchedule = Pick<
  Subscription,
  'billingCycle' | 'firstBillDate' | 'endDate' | 'trial'
>

/**
 * `YYYY-MM-DD`, the next day this reminder rings, or null if it never will again (the
 * subscription ended). Looks as far as the charge after next, so the answer is never cut off.
 * For the "Próxima" line of the Notificaciones sheet; the time comes from the settings.
 *
 * @example
 * // Monthly on the 15th, reminder 3 days before, today Oct 22
 * nextReminderDate(netflix, reminder3, '2026-10-22') // '2026-11-12'
 */
export function nextReminderDate(
  schedule: ChargeSchedule,
  reminder: SubscriptionReminder,
  today: string,
) {
  const nextCharge = nextBillDate(schedule.firstBillDate, schedule.billingCycle, today)
  const until = addCycles(nextCharge, schedule.billingCycle, 1)
  // Enabled on purpose: the question is when it would ring, even while it's switched off
  const source = {
    ...schedule,
    id: '',
    isPaused: false,
    reminders: [{ ...reminder, isEnabled: true }],
  }
  return getReminderTriggers(source, today, until)[0]?.date ?? null
}

/**
 * A reminder in words, for lists: "El mismo día", "1 día antes", "3 días antes".
 */
export function formatDaysBefore(days: number) {
  if (days === 0) return 'El mismo día'
  return `${days} ${days === 1 ? 'día' : 'días'} antes`
}

/** One notification to schedule: on which day, for which reminder, about which event. */
/** What `getReminderTriggers` reads: the charge schedule plus the reminders. A `Subscription` fits. */
export type ReminderSource = ChargeSchedule &
  Pick<Subscription, 'id' | 'isPaused' | 'reminders'>

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
  sub: ReminderSource,
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
