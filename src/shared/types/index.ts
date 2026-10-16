// ==========================================
// APP
// ==========================================

/** The bottom navigation tabs. */
export type TabType = 'home' | 'calendar' | 'statistics' | 'cards' | 'settings'

// ==========================================
// CURRENCIES
// ==========================================

/** The currencies offered by default. */
export type DefaultCurrencyCode = 'USD' | 'EUR' | 'ARS' | 'CLP' | 'GBP'
/**
 * Any ISO currency code. `(string & {})` keeps autocomplete for the defaults while
 * still accepting other codes ("BRL", "MXN"...).
 */
export type CurrencyCode = DefaultCurrencyCode | (string & {})

export interface Currency {
  code: CurrencyCode
  name: string
  /** Shown before amounts: "U$S", "€", "$". */
  symbol: string
  /** flag-icons code for the little flag, e.g. 'us', 'eu', 'ar'. */
  countryCode: string
}

// ==========================================
// CATEGORIES
// ==========================================

export interface Category {
  /** Slug for defaults ('entertainment'), `custom-<id>` for the user's own. */
  id: string
  name: string
  /** Hex color, for the Statistics charts. */
  color: string
  /** Created by the user (defaults have no flag). */
  isCustom?: boolean
}

// ==========================================
// PAYMENT METHODS / CARDS (Cards screen, not built yet)
// ==========================================

export type PaymentMethodType = 'credit' | 'bank_account'
export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'generic'

export interface PaymentMethod {
  id: string
  name: string
  type: PaymentMethodType
  /** Only for cards. */
  brand?: CardBrand
  /** To tell two cards of the same bank apart. */
  last4Digits?: string
  /** `MM/YY`, cards only. */
  expiryDate?: string
}

// ==========================================
// NOTIFICATIONS / REMINDERS (not built yet)
// ==========================================

export interface SubscriptionReminder {
  id: string
  /** 0 = the same day, 1 = the day before... */
  daysBefore: number
  /** Time of day to notify, `HH:MM`. */
  time: string
  /** Remind about the charge, or about the end of the free trial. */
  target: 'billing' | 'trial_end'
  isEnabled: boolean
}

// ==========================================
// SUBSCRIPTIONS
// ==========================================

export type BillingUnit = 'day' | 'week' | 'month' | 'year'

/**
 * How often a subscription charges: once, or every N days / weeks / months / years.
 * Check `type` first: only `'every'` has `interval` and `unit`.
 */
export type BillingCycle =
  { type: 'one-time' } | { type: 'every'; interval: number; unit: BillingUnit }

/** `trial`: in its free trial · `active`: paying · `inactive`: paused by the user. */
export type SubscriptionStatus = 'active' | 'trial' | 'inactive'

export interface TrialConfig {
  /** `YYYY-MM-DD` */
  startDate: string
  /** `YYYY-MM-DD`. The first charge is on this day. */
  endDate: string
}

/** Built-in icons for bills without a logo (see `shared/lib/icons.tsx`). */
export type IconKey = 'electricity' | 'water' | 'gas' | 'phone' | 'rent' | 'internet'

export interface Subscription {
  id: string
  name: string
  /** Per cycle, in `currency`. */
  price: number
  currency: CurrencyCode
  billingCycle: BillingCycle

  /** `YYYY-MM-DD`. Every charge is counted from this one. */
  firstBillDate: string
  /**
   * `YYYY-MM-DD`, saved when the subscription is saved, so it goes stale.
   * For display, calculate it: `nextBillDate(firstBillDate, billingCycle, todayISO())`.
   */
  nextBillDate: string
  /** `YYYY-MM-DD`. No charges after this day. */
  endDate?: string

  trial?: TrialConfig

  categoryId: string
  paymentMethodId?: string

  reminders: SubscriptionReminder[]

  /** A logo path like '/logos/logo_netflix.webp'. */
  iconUrl?: string
  /** A built-in icon, for bills without a logo. */
  iconKey?: IconKey

  status: SubscriptionStatus
  /** ISO date and time of creation. */
  createdAt: string
}

// ==========================================
// PRESETS (the ready-made subscriptions of the picker)
// ==========================================

export interface Preset {
  id: string
  name: string
  /** Company names the search also matches (e.g. 'edenor' finds "Electricidad"). */
  keywords?: string[]
  defaultCategoryId: string
  /** A logo path like '/logos/logo_netflix.webp'. */
  iconUrl?: string
  iconKey?: IconKey
}
