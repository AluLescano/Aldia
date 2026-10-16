import type { Subscription } from '@/shared/types'
import type { SubscriptionFormValues } from '../types'

/**
 * Turns a saved subscription back into form values, for the detail and edit screen.
 * The opposite of `formValuesToSubscriptionData`: the price becomes text again.
 */
export const subscriptionToFormValues = (sub: Subscription): SubscriptionFormValues => ({
  name: sub.name,
  price: String(sub.price),
  currency: sub.currency,
  billingCycle: sub.billingCycle,
  firstBillDate: sub.firstBillDate,
  endDate: sub.endDate,
  trial: sub.trial,
  categoryId: sub.categoryId,
  paymentMethodId: sub.paymentMethodId,
  reminders: sub.reminders,
  iconUrl: sub.iconUrl,
  iconKey: sub.iconKey,
})
