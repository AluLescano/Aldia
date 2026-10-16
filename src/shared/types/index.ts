// ==========================================
// APP RELATED
// ==========================================

export type TabType = 'home' | 'calendar' | 'statistics' | 'cards' | 'settings'

// ==========================================
// CURRENCIES AND ADJUSTMENTS
// ==========================================
export type DefaultCurrencyCode = 'USD' | 'EUR' | 'ARS' | 'CLP' | 'GBP'
export type CurrencyCode = DefaultCurrencyCode | (string & {})

export interface Currency {
  code: CurrencyCode
  name: string
  symbol: string
  countryCode: string // flag-icons (ej: 'us', 'eu', 'ar')
}

// ==========================================
// CATEGORIES
// ==========================================
export interface Category {
  id: string
  name: string
  color: string // Hex for Statistics page
  isCustom?: boolean
}

// ==========================================
// PAYMENT METHODS / CARDS
// ==========================================
export type PaymentMethodType = 'credit' | 'bank_account'
export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'generic'

export interface PaymentMethod {
  id: string
  name: string
  type: PaymentMethodType
  brand?: CardBrand // Optional for Bank Accounts
  last4Digits?: string // Optional to differentiate between cards
  expiryDate?: string // MM/YY - Cards Only
}

// ==========================================
// NOTIFICATIONS / REMINDERS
// ==========================================
export interface SubscriptionReminder {
  id: string
  daysBefore: number // 0 = same day, 1 = 1 day before
  time: string // HH:MM AM/PM
  target: 'billing' | 'trial_end' // Notify billing or trial ending
  isEnabled: boolean
}

// ==========================================
// SUBSCRIPTIONS / PAYMENT METHODS
// ==========================================
export type BillingUnit = 'day' | 'week' | 'month' | 'year'
export type BillingCycle =
  { type: 'one-time' } | { type: 'every'; interval: number; unit: BillingUnit }

export type SubscriptionStatus = 'active' | 'trial' | 'inactive'

export interface TrialConfig {
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
}

export type IconKey = 'electricity' | 'water' | 'gas' | 'phone' | 'rent' | 'internet'

export interface Subscription {
  id: string
  name: string
  price: number
  currency: CurrencyCode
  billingCycle: BillingCycle

  // Fechas de cobro y vigencia
  firstBillDate: string // YYYY-MM-DD
  nextBillDate: string // YYYY-MM-DD
  endDate?: string // YYYY-MM-DD

  trial?: TrialConfig

  categoryId: string
  paymentMethodId?: string

  reminders: SubscriptionReminder[]

  // Branding
  iconUrl?: string
  iconKey?: IconKey

  status: SubscriptionStatus
  createdAt: string
}

// ==========================================
// PRESETS (the ready-made subscriptions of the picker)
// ==========================================
export interface Preset {
  id: string
  name: string
  keywords?: string[] // company names the search also matches (e.g. 'edenor')
  defaultCategoryId: string
  iconUrl?: string // path like '/logos/logo_netflix.webp'
  iconKey?: IconKey
}
