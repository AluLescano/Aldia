// STORES
import { OTHERS_ID } from '@/features/categories/store/categoryStore'

// UTILS
import { todayISO } from '@/shared/lib/isoDate'
import { presetIcon } from './subscriptionIcon'

// TYPES
import type { Category, CurrencyCode, Preset } from '@/shared/types'
import type { SubscriptionFormValues } from '../types'

/**
 * Starting values for a new subscription: monthly, first charge today (or `firstBillDate`),
 * empty price.
 * A preset fills the name, the category and the logo; without one (custom
 * subscription) the name is empty and the category is "Otros".
 *
 * @param preset the preset picked in the preset picker, if any.
 * @param currency the currency to start with (the one selected on Home).
 * @param categories the categories that exist now. The user may have deleted the
 * preset's default category; then the subscription starts in "Otros".
 * @param firstBillDate `YYYY-MM-DD`, when it was added from a Calendario day. Missing = today.
 */
export const newSubscriptionValues = (
  preset: Preset | undefined,
  currency: CurrencyCode,
  categories: Category[],
  firstBillDate?: string,
): SubscriptionFormValues => {
  const presetCategory = preset?.defaultCategoryId
  const categoryExists = categories.some((category) => category.id === presetCategory)

  return {
    name: preset?.name ?? '',
    price: '',
    currency,
    billingCycle: { type: 'every', interval: 1, unit: 'month' },
    firstBillDate: firstBillDate ?? todayISO(),
    reminders: [],
    categoryId: presetCategory && categoryExists ? presetCategory : OTHERS_ID,
    icon: presetIcon(preset),
  }
}
