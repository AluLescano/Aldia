import { parsePrice } from './validateSubscriptionForm'

// TYPES
import type { CurrencyCode, Subscription } from '@/shared/types'
import type { SubscriptionFormValues } from '../types'

/**
 * Everything a form can produce. The id, the pauses and the creation date are not form
 * fields, and the form edits one price, not the history: the screen turns `price` +
 * `currency` into the history (a new one, or `applyPriceEdit` on the saved one).
 */
export type SubscriptionData = Omit<
  Subscription,
  'id' | 'pauses' | 'createdAt' | 'priceHistory'
> & { price: number; currency: CurrencyCode }

/**
 * Turns the form's values (price as text) into the stored shape (price as a number).
 * The opposite of `subscriptionToFormValues`.
 *
 * @returns the data, or `null` if the price or the currency is not usable.
 */
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
    // Keys that stay `undefined` (not missing) so that updating really clears them
    endDate: values.endDate || undefined,
    paymentMethodId: values.paymentMethodId || undefined,
    trial: values.trial,
    categoryId: values.categoryId,
    reminders: values.reminders,
    icon: values.icon,
  }
}
