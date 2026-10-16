# Aldia Architecture & Engineering Guide

## 1. Vision & Technical Principles

**Aldia** is an offline-first subscription and recurring expense tracker designed for Android (via Capacitor) and Desktop (via Electron or Tauri, planned for v2).

### Guiding Principles

1. **Zero Spaghetti Code (Strict Separation of Concerns):**
   - **UI components** (`components/`): Present data and handle user events. They _never_ calculate totals or exchange rates, parse dates, or directly touch storage.
   - **Hooks** (`hooks/`): Component logic that several components share or that would bury the JSX (form state, editors, field wiring).
   - **Stores** (`store/`): Zustand stores hold state and the actions that change it.
   - **Utilities**: Pure TypeScript functions with no React dependency (easily testable and portable). In `features/<feature>/utils/` when one feature uses them, in `shared/lib/` when several do.
2. **Local-First & Privacy-Focused:**
   - All user data remains on the device.
   - Backups are plain, versioned JSON files that can be exported or synced directly with Google Drive without an intermediary backend server.
3. **Native Feel on Mobile:**
   - 48px minimum touch targets.
   - Respect Safe Area Insets (status bar, camera cutouts, gesture navigation bar).
   - Bottom sheets for contextual actions, full-screen dialogs for complex authoring flows.

---

## 2. Directory Structure (Feature-Driven Architecture)

The codebase is organized by business features rather than generic file types. This ensures that as the app grows, files that change together stay together.

Two rules decide where a file goes:

- **`shared/` never imports from `features/`.** Shared code can't know about a feature, only the other way around.
- **Something moves to `shared/` when two or more features use it.** Until then it stays in its feature. (Domain types used everywhere, like `Subscription`, live in `shared/types`.)

```text
src/
├── App.tsx                   # Tab switch (TabType), bottom nav, overlay renderer, toast host
├── main.tsx
├── assets/icons/             # Icon* components on the shared Icon base (24px, stroke 2)
│
├── features/                 # Domain-driven feature modules
│   ├── categories/
│   │   ├── categoryStore.ts  # Zustand + persist (aldia_categories_v1), OTHERS_ID
│   │   ├── components/       # CategoryPicker, CategoryFooter
│   │   ├── hooks/            # useCategoryEditor (add / rename / delete state)
│   │   └── utils/            # validateCategoryName
│   ├── homepage/
│   │   └── components/       # MonthlyExpenses, SubscriptionList, SubscriptionCard, skeletons
│   ├── subscriptions/
│   │   ├── components/       # SubscriptionForm, BillingCyclePicker, PresetCard, PauseToggleIcon
│   │   ├── data/             # presets.ts (the preset picker list)
│   │   ├── hooks/            # useSubscriptionActions (pause, delete)
│   │   ├── store/            # subscriptionStore.ts (Zustand + persist)
│   │   ├── utils/            # billingCycle, validation, form <-> subscription mapping, status
│   │   └── types.ts          # SubscriptionFormValues, FormErrors
│   ├── settings/
│   │   └── store.ts          # useSettingsStore (selected + favorite currencies)
│   └── navigation/
│       └── components/       # BottomNavBar
│   (planned: cards/, calendar/, statistics/)
│
├── pages/                    # Screen level views (orchestrate feature components)
│   ├── home/HomePage.tsx
│   ├── calendar/CalendarPage.tsx
│   ├── cards/CardsPage.tsx
│   ├── statistics/StatisticsPage.tsx
│   ├── settings/SettingsPage.tsx
│   ├── presetPicker/PresetPicker.tsx              # Overlay, not a tab
│   └── subscriptionForm/SubscriptionFormPage.tsx  # Overlay: new, detail and edit
│
├── shared/                   # Generic code that has NO domain knowledge
│   ├── ui/                   # Button, Field, Input*, Switch, BottomSheet, DatePicker, CurrencyPicker, Avatar, Toast, Typography...
│   ├── hooks/                # useFieldControl (field ids, aria links, shake), useShake
│   ├── lib/                  # isoDate, calendar, currencies, formatDate, id, icons, normalizeText, storage
│   ├── store/                # uiStore.ts (overlay stack), toastStore.ts (app toast)
│   └── types/                # index.ts (all domain types)
│
└── styles/                   # _variables.scss (design tokens) and _themes.scss (light/dark)
```

Each component lives in its own folder with a matching `*.module.scss` file (SCSS Modules). Styling is SCSS only.

Known leftovers to tidy later: the three stores use three file layouts (`subscriptions/store/subscriptionStore.ts`, `categories/categoryStore.ts`, `settings/store.ts`); the target is `features/<feature>/store/<name>Store.ts`. `features/homepage` is named after a page; its list and card components belong in `features/subscriptions`.

---

## 3. Data Models (Domain Entities)

All domain types are strictly typed in `src/shared/types/index.ts`. That file is the source of truth; the summary below may lag behind it.

### A. Subscription Entity

```typescript
export type BillingUnit = 'day' | 'week' | 'month' | 'year'
export type BillingCycle =
  { type: 'one-time' } | { type: 'every'; interval: number; unit: BillingUnit }
export type SubscriptionStatus = 'active' | 'trial' | 'inactive'

export interface Subscription {
  id: string
  name: string
  price: number
  currency: CurrencyCode // 'USD' | 'EUR' | 'ARS' | 'CLP' | 'GBP' | any string
  billingCycle: BillingCycle

  firstBillDate: string // YYYY-MM-DD
  nextBillDate: string // YYYY-MM-DD
  endDate?: string // YYYY-MM-DD
  trial?: TrialConfig // { startDate, endDate }

  categoryId: string
  paymentMethodId?: string
  reminders: SubscriptionReminder[]

  iconUrl?: string
  iconKey?: IconKey // built-in icon for bills (electricity, water, gas, phone, rent, internet)
  status: SubscriptionStatus
  createdAt: string
}
```

### B. Payment Method (Cards / Accounts)

```typescript
export type PaymentMethodType = 'credit' | 'bank_account'
export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'generic'

export interface PaymentMethod {
  id: string
  name: string
  type: PaymentMethodType
  brand?: CardBrand // Optional for bank accounts
  last4Digits?: string
  expiryDate?: string // MM/YY, cards only
}
```

### C. Category

```typescript
export interface Category {
  id: string
  name: string
  color: string // Hex, used by the Statistics page
  isCustom?: boolean
}
```

### D. Currency, Reminders and Presets

```typescript
export interface Currency {
  code: CurrencyCode
  name: string
  symbol: string
  countryCode: string // flag-icons code, e.g. 'us', 'eu', 'ar'
}

export interface SubscriptionReminder {
  id: string
  daysBefore: number // 0 = same day
  time: string // HH:MM AM/PM
  target: 'billing' | 'trial_end'
  isEnabled: boolean
}

export interface Preset {
  id: string
  name: string
  keywords?: string[] // company names the search also matches
  defaultCategoryId: string
  iconUrl?: string
  iconKey?: IconKey
}
```

User preferences currently live in `useSettingsStore` (`selectedCurrency`, `favoriteCurrencies`). Theme and reminder settings are planned.

---

## 4. State Management

State lives in **Zustand** stores:

- `useSubscriptionStore` (`features/subscriptions/store/subscriptionStore.ts`): subscriptions plus `addSubscription`, `deleteSubscription` (keeps `lastDeleted` for the undo toast), `undoDelete`, `updateSubscription`, `reassignCategory`. Uses the `persist` middleware, so it saves itself to `localStorage` under `aldia_subscriptions_v1`.
- `useSettingsStore` (`features/settings/store.ts`): selected and favorite currencies. Loads from and saves to `localStorage` by hand through `shared/lib/storage.ts`, under `aldia_settings` (to move onto `persist` like the others).
- `useCategoryStore` (`features/categories/categoryStore.ts`): default and custom categories with `addCategory`, `renameCategory`, `deleteCategory` (moves its subscriptions to "Otros" first). Persisted under `aldia_categories_v1`.
- `useToastStore` (`shared/store/toastStore.ts`): the one app-wide toast, rendered by `App.tsx`.
- `useUIStore` (`shared/store/uiStore.ts`): a stack of overlays (`preset-picker`, `subscription-form`) with `pushOverlay`, `popOverlay` and `closeAllOverlays`. `App.tsx` renders the top of the stack.

Why Zustand: no Redux boilerplate (`actions`, `reducers`, `dispatch`), an out-of-the-box `persist` middleware, and components only re-render for the state slices they select.

---

## 5. Storage & Google Drive Backup Strategy

### Local Storage Schema

Data is saved under versioned keys:

- `aldia_subscriptions_v1` (in use)
- `aldia_settings` (in use)
- `aldia_categories_v1` (in use)
- `aldia_cards_v1` (planned)
- `aldia_rates` (in use): the last downloaded exchange rates and the day they were downloaded

**Durability:** these keys live in the WebView's `localStorage`, which Android can clear (low storage, WebView reset). Before testers rely on the app, the stores move to Capacitor Preferences through a custom `persist` storage, and JSON export ships as the backup.

### Backup JSON Format (planned)

```json
{
  "version": 1,
  "exportedAt": "2026-09-04T19:00:00.000Z",
  "data": {
    "subscriptions": [...],
    "cards": [...],
    "categories": [...],
    "settings": { ... }
  }
}
```

- **Drive Sync (planned, v1.1):** The user will authorize with Google OAuth2. The app simply uploads this versioned JSON blob to an app-private `appDataFolder` on Google Drive, requiring zero external database hosting.

---

## 6. How to Add a New Feature Without Spaghetti Code

When you want to build a new screen or component:

1. **Define Types First:** Domain entities used across features go in `src/shared/types/index.ts`; types only one feature needs (like the form values) go in `src/features/<feature>/types.ts`.
2. **Create Pure Utilities:** Put math, formatters, and data transformation in `src/shared/lib/` (or `src/features/<feature>/utils/` when they belong to one feature).
3. **Build UI Primitives in `shared/ui/`:** If you need a reusable badge, switch, or button, create it in `src/shared/ui/`.
4. **Add State When Needed:** Create a Zustand store in `src/features/<feature>/store/`.
5. **Create Domain Components:** Build feature components in `src/features/<feature>/components/`, each with its own `*.module.scss`.
6. **Assemble in `pages/`:** The page file only imports and arranges the feature components.

---

## 7. Rules Learned the Hard Way

Each of these comes from a real bug in this codebase.

- **Never store what you can calculate.** A stored `nextBillDate` goes stale as soon as the date passes. Store the inputs (`firstBillDate`, `billingCycle`) and calculate the next charge when showing it. The same goes for converted prices: store the price in its own currency, convert on screen.
- **Dates are `YYYY-MM-DD` strings in local time.** Use `shared/lib/isoDate.ts` (`parseISODate`, `toISODate`, `todayISO`); never `toISOString()`, which works in UTC and can move a date to the day before in Argentina.
- **Persisted data carries a version.** Changing the shape of a stored object must come with a Zustand `persist` `version` + `migrate`, or users lose their data on update.
- **One way out with the Android back button.** Back closes the top-most layer first (bottom sheet, then overlay), and only leaves the app from a main tab (Capacitor App plugin `backButton` listener, once Android is set up).
- **A control inside `Field` is a plain `<input>` or `<button>`.** `Field` owns the look; the `Button` component is for actions and brings its own styles and ripple.
- **Class names go through `cn()`**, never through template strings with `? x : ''`.
- **Exported helpers, hooks and component props get JSDoc** (`/** ... */`), so hovering explains them.

---

## 8. Exchange Rates

- Source: the free [exchange-api](https://github.com/fawazahmed0/exchange-api) (no key, daily JSON on a CDN, with a fallback URL). Download and conversion live in `shared/lib/exchangeRates.ts`.
- `useRatesStore` (`shared/store/ratesStore.ts`, persisted as `aldia_rates`) downloads once per local day: `App.tsx` calls `refreshIfStale()` on start and every time the app becomes visible again. Two calls at once share one download. If the download fails, the last saved rates stay in use.
- Conversion is a pure function (`convert(amount, from, to, rates)`), so totals and statistics stay testable offline. The same currency never needs rates.
- Home (`getMonthlyTotal` in `features/subscriptions/utils/monthlyTotal.ts`) adds only the active subscriptions, each turned into its monthly cost (`monthlyEquivalent`) and converted. It says so when rates are older than today ("Tasas del ...") or when some subscriptions could not be converted ("N sin sumar").
- Known limit: the API gives official rates. A USD subscription paid with an Argentine card is charged at the official rate plus taxes, so the ARS total can be lower than the real charge.

---

## 9. Testing (planned)

Vitest for the pure functions first: billing cycles and next charge dates, validation, monthly totals, currency conversion, the calendar grid. They hold most of the logic and need no browser.
