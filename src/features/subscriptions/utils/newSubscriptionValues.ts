// STORES
import { OTHERS_ID } from '@/features/categories/categoryStore'

// UTILS
import { todayISO } from '@/shared/lib/isoDate'

// TYPES
import type { CurrencyCode, Preset } from '@/shared/types'
import type { SubscriptionFormValues } from '../types'

/**
 * Starting values for a new subscription: monthly, first charge today, empty price.
 * A preset fills the name, the category and the logo; without one (custom
 * subscription) the name is empty and the category is "Otros".
 *
 * @param preset the preset picked in the preset picker, if any.
 * @param currency the currency to start with (the one selected on Home).
 */
export const newSubscriptionValues = (
  preset: Preset | undefined,
  currency: CurrencyCode,
): SubscriptionFormValues => ({
  name: preset?.name ?? '',
  price: '',
  currency,
  billingCycle: { type: 'every', interval: 1, unit: 'month' },
  firstBillDate: todayISO(),
  reminders: [],
  categoryId: preset?.defaultCategoryId ?? OTHERS_ID,
  iconUrl: preset?.iconUrl,
  iconKey: preset?.iconKey,
})
