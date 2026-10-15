import type { Subscription } from '@/shared/types'
import type { SubscriptionFormValues } from './validateSubscriptionForm'

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