// UTILS
import { formatAmount, getCurrencySymbol } from '@/shared/lib/currencies'
import { formatDayMonth } from '@/shared/lib/formatDate'
import { addDays, daysBetween, parseISODate, toISODate } from '@/shared/lib/isoDate'
import {
  getReminderTriggers,
  groupTriggersByDay,
  type ReminderDay,
  type ReminderTrigger,
} from '@/features/subscriptions/utils/reminders'

// TYPES
import type { Subscription } from '@/shared/types'

/** How far ahead the phone gets notifications; re-planned every time the app opens. */
export const PLANNING_DAYS = 60

/** One notification to hand to the phone: at most one per day. */
export interface PlannedNotification {
  /** The day as a number (Nov 12, 2026 → 20261112): fits Android's 32-bit ids, never repeats. */
  id: number
  title: string
  body: string
  /** When it rings, in the phone's local time. */
  at: Date
}

/** "hoy", "mañana" or "en N días": how far the charge is from the notification. */
const whenText = (days: number) =>
  days === 0 ? 'hoy' : days === 1 ? 'mañana' : `en ${days} días`

const amountText = (sub: Subscription) =>
  `${getCurrencySymbol(sub.currency)} ${formatAmount(sub.price)}`

// The text of a day with one subscription: a charge, or the end of its free trial
function singleText(trigger: ReminderTrigger, sub: Subscription) {
  const when = whenText(daysBetween(trigger.date, trigger.eventDate))
  if (trigger.target === 'trial_end') {
    return {
      title: `Tu prueba de ${sub.name} termina ${when}`,
      body: `Después se cobran ${amountText(sub)}. Si no la quieres, cancélala antes.`,
    }
  }
  return {
    title: `${sub.name} se cobra ${when}`,
    body: `${amountText(sub)} · ${formatDayMonth(trigger.eventDate)}`,
  }
}

// The text of a day with several subscriptions: one summary, the names in the body
function summaryText(day: ReminderDay, byId: Map<string, Subscription>) {
  const lines = day.triggers.flatMap((trigger) => {
    const sub = byId.get(trigger.subscriptionId)
    if (!sub) return []
    return [`${sub.name} (${whenText(daysBetween(trigger.date, trigger.eventDate))})`]
  })
  return {
    title: `${lines.length} subscripciones se cobran pronto`,
    body: lines.join(', '),
  }
}

/**
 * Everything the phone should notify in the next `PLANNING_DAYS`: every subscription's
 * reminders, bundled by day (one notification per day), with their texts. Pure: give it the
 * current moment and the time from the settings, it never touches the phone.
 * A notification whose time already passed today is left out.
 *
 * @param now The current moment (`new Date()`).
 * @param reminderTime `HH:MM`, the time every notification rings.
 */
export function buildNotifications(
  subscriptions: Subscription[],
  now: Date,
  reminderTime: string,
): PlannedNotification[] {
  const today = toISODate(now)
  const until = addDays(today, PLANNING_DAYS)
  const byId = new Map(subscriptions.map((sub) => [sub.id, sub]))
  const [hours, minutes] = reminderTime.split(':').map(Number)

  const triggers = subscriptions.flatMap((sub) => getReminderTriggers(sub, today, until))

  return groupTriggersByDay(triggers).flatMap((day) => {
    const at = parseISODate(day.date)
    if (!at) return []
    at.setHours(hours, minutes, 0, 0)
    if (at <= now) return [] // today, but the time already passed

    const sub = byId.get(day.triggers[0].subscriptionId)
    const text =
      day.triggers.length === 1 && sub
        ? singleText(day.triggers[0], sub)
        : summaryText(day, byId)

    return [{ id: Number(day.date.replaceAll('-', '')), ...text, at }]
  })
}
