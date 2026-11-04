// UTILS
import { upcomingPrice } from './subscriptionHistory'

// TYPES
import type { Subscription } from '@/shared/types'
import type { SubscriptionFormValues } from '../types'

/**
 * Turns a saved subscription back into form values, for the detail and edit screen.
 * The opposite of `formValuesToSubscriptionData`: the price becomes text again. It's the
 * price of the next charge, so a change saved for it shows right away.
 *
 * @param today `YYYY-MM-DD`, pass `todayISO()`.
 */
export const subscriptionToFormValues = (
  sub: Subscription,
  today: string,
): SubscriptionFormValues => {
  const { price, currency } = upcomingPrice(sub, today)
  return {
    name: sub.name,
    price: String(price),
    currency,
    billingCycle: sub.billingCycle,
    firstBillDate: sub.firstBillDate,
    endDate: sub.endDate,
    trial: sub.trial,
    categoryId: sub.categoryId,
    paymentMethodId: sub.paymentMethodId,
    reminders: sub.reminders,
    icon: sub.icon,
  }
}
