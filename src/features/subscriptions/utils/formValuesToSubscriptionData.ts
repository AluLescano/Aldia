import { todayISO } from '@/shared/lib/isoDate'
import type { Subscription } from '@/shared/types'

import { nextBillDate } from './billingCycle'
import type { SubscriptionFormValues } from '../types'
import { parsePrice } from './validateSubscriptionForm'

// Everything a form can produce. The id, the status and the creation date are not form fields.
export type SubscriptionData = Omit<Subscription, 'id' | 'status' | 'createdAt'>

// Turns the form's text values into the stored shape, or null if the price or currency is not usable
export const formValuesToSubscriptionData = (
  values: SubscriptionFormValues,
): SubscriptionData | null => {
  const price = parsePrice(values.price)
  if (price === null || values.currency === '') return null

  return {
    name: values.name.trim(),
    price,
    currency: values.currency,
    billingCycle: values.billingCycle,
    firstBillDate: values.firstBillDate,
    nextBillDate: nextBillDate(values.firstBillDate, values.billingCycle, todayISO()),
    // Keys that stay `undefined` (not missing) so that updating really clears them
    endDate: values.endDate || undefined,
    paymentMethodId: values.paymentMethodId || undefined,
    trial: values.trial,
    categoryId: values.categoryId,
    reminders: values.reminders,
    iconUrl: values.iconUrl,
    iconKey: values.iconKey,
  }
}
