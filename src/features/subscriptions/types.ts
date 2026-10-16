import type {
  BillingCycle,
  CurrencyCode,
  IconKey,
  SubscriptionReminder,
  TrialConfig,
} from '@/shared/types'

// What the form edits: like a Subscription, but the price stays text while typing
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

export type FormErrors = Partial<Record<keyof SubscriptionFormValues, string>>
