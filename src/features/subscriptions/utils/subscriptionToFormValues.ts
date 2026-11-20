// UTILS
import { upcomingPrice } from './subscriptionHistory'
import { editAnchor } from './scheduleEdit'

// TYPES
import type { Subscription } from '@/shared/types'
import type { SubscriptionFormValues } from '../types'

/**
 * Turns a saved subscription back into form values, for the detail and edit screen.
 * The opposite of `formValuesToSubscriptionData`: the price becomes text again. It's the
 * price of the next charge, so a change saved for it shows right away. The date and the
 * cycle are the next charge and its cycle (or the first charge, see `editAnchor`): the form
 * edits one rhythm, and the screen merges it into the schedule (`applyScheduleEdit`).
 *
 * @param today `YYYY-MM-DD`, pass `todayISO()`.
 */
export const subscriptionToFormValues = (
  sub: Subscription,
  today: string,
): SubscriptionFormValues => {
  const { price, currency } = upcomingPrice(sub, today)
  const anchor = editAnchor(sub, today)
  return {
    name: sub.name,
    price: String(price),
    currency,
    billingCycle: anchor.billingCycle,
    firstBillDate: anchor.date,
    endDate: sub.endDate,
    trial: sub.trial,
    categoryId: sub.categoryId,
    paymentMethodId: sub.paymentMethodId,
    reminders: sub.reminders,
    icon: sub.icon,
  }
}
