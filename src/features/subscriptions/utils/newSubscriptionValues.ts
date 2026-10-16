// STORES
import { OTHERS_ID } from '@/features/categories/categoryStore'

// UTILS
import { todayISO } from '@/shared/lib/isoDate'

// TYPES
import type { Category, CurrencyCode, Preset } from '@/shared/types'
import type { SubscriptionFormValues } from '../types'

/**
 * Starting values for a new subscription: monthly, first charge today, empty price.
 * A preset fills the name, the category and the logo; without one (custom
 * subscription) the name is empty and the category is "Otros".
 *
 * @param preset the preset picked in the preset picker, if any.
 * @param currency the currency to start with (the one selected on Home).
 * @param categories the categories that exist now. The user may have deleted the
 * preset's default category; then the subscription starts in "Otros".
 */
export const newSubscriptionValues = (
  preset: Preset | undefined,
  currency: CurrencyCode,
  categories: Category[],
): SubscriptionFormValues => {
  const presetCategory = preset?.defaultCategoryId
  const categoryExists = categories.some((category) => category.id === presetCategory)

  return {
    name: preset?.name ?? '',
    price: '',
    currency,
    billingCycle: { type: 'every', interval: 1, unit: 'month' },
    firstBillDate: todayISO(),
    reminders: [],
    categoryId: presetCategory && categoryExists ? presetCategory : OTHERS_ID,
    iconUrl: preset?.iconUrl,
    iconKey: preset?.iconKey,
  }
}
