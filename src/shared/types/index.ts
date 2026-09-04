// Universal domain entities for Aldia

export type BillingCycle = 'weekly' | 'monthly' | 'quarterly' | 'biannual' | 'yearly'

export interface Category {
  id: string
  name: string
  icon: string
  color: string
}

export interface Subscription {
  id: string
  name: string
  description?: string
  price: number
  currency: string // ISO 4217 code (USD, EUR, ARS, etc.)
  billingCycle: BillingCycle
  firstBillDate: string // YYYY-MM-DD
  nextBillDate: string // YYYY-MM-DD
  categoryId: string
  paymentMethodId?: string
  reminderDaysBefore?: number
  iconUrl?: string
  brandColor?: string
  isActive: boolean
  notes?: string
  createdAt: string
}

export type PaymentMethodType = 'credit' | 'debit' | 'bank_account' | 'cash' | 'other'
export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'generic'

export interface PaymentMethod {
  id: string
  name: string
  type: PaymentMethodType
  last4?: string
  expiryDate?: string // MM/YY
  brand: CardBrand
  colorGradient: string
}

export interface CurrencyConfig {
  code: string
  symbol: string
  name: string
  exchangeRateToBase?: number
}

export interface AppSettings {
  primaryCurrency: string
  favoriteCurrencies: string[]
  theme: 'dark' | 'light' | 'system'
  reminderTime: string
  notificationsEnabled: boolean
}

export type TabType = 'home' | 'calendar' | 'cards' | 'statistics' | 'settings'
