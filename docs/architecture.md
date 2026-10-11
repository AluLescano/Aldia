# Aldia Architecture & Engineering Guide

## 1. Vision & Technical Principles

**Aldia** is an offline-first subscription and recurring expense tracker designed for Android (via Capacitor) and Desktop (via Electron or Tauri, planned for v2).

### Guiding Principles

1. **Zero Spaghetti Code (Strict Separation of Concerns):**
   - **UI components** (`components/`): Present data and handle user events. They _never_ calculate exchange rates, parse dates, or directly touch storage.
   - **Stores** (`store/` or `store.ts`): Zustand stores hold state and the actions that change it.
   - **Utilities** (`shared/lib/`): Pure TypeScript functions with no React dependency (easily testable and portable).
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

```text
src/
├── App.tsx                   # Tab switch (TabType), bottom nav and overlay renderer
├── main.tsx
├── assets/icons/             # Icon* components (SVG)
│
├── features/                 # Domain-driven feature modules
│   ├── homepage/
│   │   └── components/       # MonthlyExpenses, SubscriptionList, SubscriptionCard, skeletons
│   ├── subscriptions/
│   │   ├── components/       # PresetCard
│   │   └── store/            # subscriptionStore.ts (Zustand + persist)
│   ├── settings/
│   │   ├── components/       # CurrencyPicker
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
│   └── presetPicker/PresetPicker.tsx   # Opened as an overlay, not a tab
│
├── shared/                   # Generic code that has NO domain knowledge
│   ├── ui/                   # Button, BottomSheet, BackdropFilter, Pill, Toast, Typography
│   ├── lib/                  # currencies.ts, presets.ts, storage.ts
│   ├── store/                # uiStore.ts (overlay stack)
│   └── types/                # index.ts (all domain types)
│
└── styles/                   # _variables.scss (design tokens) and _themes.scss (light/dark)
```

Each component lives in its own folder with a matching `*.module.scss` file (SCSS Modules). Styling is SCSS only.

---

## 3. Data Models (Domain Entities)

All domain types are strictly typed in `src/shared/types/index.ts`. That file is the source of truth; the summary below may lag behind it.

### A. Subscription Entity

```typescript
export type BillingCycle = 'one-time' | 'weekly' | 'monthly' | 'bimonthly' | 'semiannual' | 'yearly'
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
  brandColor?: string
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

### D. Currency, Reminders and Templates

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

export interface SubscriptionTemplate {
  id: string
  name: string
  defaultCategoryId?: string
  iconUrl: string
  brandColor?: string
}
```

User preferences currently live in `useSettingsStore` (`selectedCurrency`, `favoriteCurrencies`). Theme and reminder settings are planned.

---

## 4. State Management

State lives in **Zustand** stores:

- `useSubscriptionStore` (`features/subscriptions/store/subscriptionStore.ts`): subscriptions plus `addSubscription`, `deleteSubscription`, `updateSubscription`. Uses the `persist` middleware, so it saves itself to `localStorage` under `aldia_subscriptions_v1`.
- `useSettingsStore` (`features/settings/store.ts`): selected and favorite currencies. Loads from and saves to `localStorage` by hand through `shared/lib/storage.ts`, under `aldia_settings`.
- `useUIStore` (`shared/store/uiStore.ts`): a stack of overlays (`preset-picker`, `subscription-form`) with `pushOverlay`, `popOverlay` and `closeAllOverlays`. `App.tsx` renders the top of the stack.

Why Zustand: no Redux boilerplate (`actions`, `reducers`, `dispatch`), an out-of-the-box `persist` middleware, and components only re-render for the state slices they select.

---

## 5. Storage & Google Drive Backup Strategy

### Local Storage Schema

Data is saved under versioned keys:

- `aldia_subscriptions_v1` (in use)
- `aldia_settings` (in use)
- `aldia_cards_v1` (planned)
- `aldia_categories_v1` (planned)

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

1. **Define Types First:** Add shared interfaces to `src/shared/types/index.ts`.
2. **Create Pure Utilities:** Put math, formatters, and data transformation in `src/shared/lib/` (or `src/features/<feature>/utils/` when they belong to one feature).
3. **Build UI Primitives in `shared/ui/`:** If you need a reusable badge, switch, or button, create it in `src/shared/ui/`.
4. **Add State When Needed:** Create a Zustand store in `src/features/<feature>/store/`.
5. **Create Domain Components:** Build feature components in `src/features/<feature>/components/`, each with its own `*.module.scss`.
6. **Assemble in `pages/`:** The page file only imports and arranges the feature components.
