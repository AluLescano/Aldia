// TYPES
import type {
  BillingCycle,
  CurrencyCode,
  IconKey,
  SubscriptionReminder,
  TrialConfig,
} from '@/shared/types'

/**
 * What the subscription form edits: like a `Subscription`, but the price stays text
 * while typing ("12," is half-typed, not a number yet) and there is no id or status.
 */
export interface SubscriptionFormValues {
  name: string
  price: string
  currency: CurrencyCode | ''
  billingCycle: BillingCycle

  // Fechas de cobro y vigencia
  firstBillDate: string // YYYY-MM-DD
  endDate?: string // YYYY-MM-DD

  trial?: TrialConfig

  categoryId: string
  paymentMethodId?: string

  reminders: SubscriptionReminder[]

  // Branding
  iconUrl?: string
  iconKey?: IconKey
}

/** One Spanish message per invalid field; a field that is valid has no key. */
export type FormErrors = Partial<Record<keyof SubscriptionFormValues, string>>
