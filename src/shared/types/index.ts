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

/** A currency the user can pick, as shown in the currency sheet. */
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

/** A spending category ("Entretenimiento"...), the default ones and the user's own. */
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

/** A credit card or a bank account. */
export type PaymentMethodType = 'credit' | 'bank_account'
/** The card network, for its logo. `generic` when unknown. */
export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'generic'

/** A card or account the user pays subscriptions with. */
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
// NOTIFICATIONS / REMINDERS
// ==========================================

/** One notification before a charge or before a free trial ends. */
export interface SubscriptionReminder {
  id: string
  /** 0 = the same day, 1 = the day before... */
  daysBefore: number
  isEnabled: boolean
}

// ==========================================
// SUBSCRIPTIONS
// ==========================================

/** The unit of an `every` billing cycle: every N days, weeks, months or years. */
export type BillingUnit = 'day' | 'week' | 'month' | 'year'

/**
 * How often a subscription charges: once, or every N days / weeks / months / years.
 * Check `type` first: only `'every'` has `interval` and `unit`.
 */
export type BillingCycle =
  { type: 'one-time' } | { type: 'every'; interval: number; unit: BillingUnit }

/**
 * `trial`: in its free trial · `active`: paying · `inactive`: paused by the user ·
 * `ended`: no charges left (its `endDate` comes before the next one).
 * Never stored (a trial ends on its own): calculate it with `statusFor(sub, todayISO())`.
 */
export type SubscriptionStatus = 'active' | 'trial' | 'inactive' | 'ended'

/** A free trial: no charges between these two days. */
export interface TrialConfig {
  /** `YYYY-MM-DD` */
  startDate: string
  /** `YYYY-MM-DD`. The first charge is on this day. */
  endDate: string
}

/** Built-in icons for bills without a logo (see `shared/lib/icons.tsx`). */
export type IconKey = 'electricity' | 'water' | 'gas' | 'phone' | 'rent' | 'internet'

/**
 * A price that applies to the charges from `from` on, until the next change.
 * Read it with `priceOn(history, date)` (`subscriptionHistory.ts`).
 */
export interface PriceChange {
  /** `YYYY-MM-DD`. A charge day: prices only change on one. */
  from: string
  /** Per cycle, in `currency`. */
  price: number
  currency: CurrencyCode
}

/**
 * Every price a subscription has had, oldest first. Never empty: the first entry starts
 * on `firstBillDate`, so every charge has a price (the type guarantees at least one).
 */
export type PriceHistory = [PriceChange, ...PriceChange[]]

/**
 * A time the user paused a subscription: no charges in `[from, to)`. Recorded by
 * the Pause / Resume buttons (never typed in), and only kept if it skipped a charge.
 */
export interface Pause {
  /** `YYYY-MM-DD`. The day it was paused. */
  from: string
  /** `YYYY-MM-DD`. The day it was resumed; a charge on this day happens. Missing while still paused. */
  to?: string
}

/**
 * The picture on a subscription's card and form. No icon at all: the Avatar shows the
 * name's initial. Check `kind` first, like `BillingCycle`'s `type`.
 */
export type SubscriptionIcon =
  /** A logo bundled with the app, e.g. '/logos/logo_netflix.webp'. */
  | { kind: 'preset'; path: string }
  /** A logo downloaded for this subscription, saved on the phone. Only the file name
      is stored: the full path can change between installs. */
  | { kind: 'file'; fileName: string }
  /** A built-in icon, for bills without a logo. */
  | { kind: 'key'; key: IconKey }

/** A saved subscription or recurring bill. Persisted in the subscription store. */
export interface Subscription {
  id: string
  name: string
  /**
   * Every price it has had, oldest first; the only place the price lives. Read the
   * current one with `priceOn(sub.priceHistory, todayISO())`.
   */
  priceHistory: PriceHistory
  billingCycle: BillingCycle

  /** `YYYY-MM-DD`. Every charge is counted from this one. */
  firstBillDate: string
  /** `YYYY-MM-DD`. No charges after this day. */
  endDate?: string

  trial?: TrialConfig

  categoryId: string
  paymentMethodId?: string

  reminders: SubscriptionReminder[]

  /** Its logo or built-in icon; missing = the name's initial. */
  icon?: SubscriptionIcon

  /**
   * The times the user paused it, oldest first. The only part of the status that is
   * stored (see `SubscriptionStatus`): paused today = `isPausedOn(sub.pauses, todayISO())`.
   */
  pauses: Pause[]
  /** ISO date and time of creation. */
  createdAt: string
}

// ==========================================
// PRESETS (the ready-made subscriptions of the picker)
// ==========================================

/** A ready-made subscription in the picker; tapping it fills the form. */
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
