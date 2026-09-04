# Aldia Architecture & Engineering Guide

## 1. Vision & Technical Principles

**Aldia** is an offline-first subscription and recurring expense tracker designed for Android (via Capacitor) and Desktop (via Electron).

### Guiding Principles

1. **Zero Spaghetti Code (Strict Separation of Concerns):**
   - **UI components** (`components/`): Present data and handle user events. They _never_ calculate exchange rates, parse dates, or directly touch storage.
   - **Custom Hooks** (`hooks/`): Encapsulate stateful logic, side effects, and calculations.
   - **Services / Utilities** (`lib/` or `services/`): Pure TypeScript functions with no React dependency (easily testable and portable).
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
├── app/                      # Application entry, global wrappers & providers
│   ├── providers/            # AppSettingsContext, CurrencyContext
│   └── styles/               # Global CSS & theme tokens
│
├── features/                 # Domain-driven feature modules
│   ├── subscriptions/        # Subscription catalog, tracker, calculations
│   │   ├── components/       # SubscriptionCard, PresetPicker, SubscriptionForm
│   │   ├── hooks/            # useSubscriptions.ts, useBillingMath.ts
│   │   ├── services/         # presetsData.ts, subscriptionStorage.ts
│   │   └── types/            # Subscription, BillingCycle
│   │
│   ├── cards/                # Mock credit cards & payment methods
│   │   ├── components/       # CardVisual, AddCardSheet
│   │   ├── hooks/            # useCards.ts
│   │   └── types/            # PaymentMethod, CardBrand
│   │
│   ├── calendar/             # Monthly calendar & charge projection
│   │   ├── components/       # CalendarGrid, DayDetailsSheet
│   │   └── utils/            # dateProjections.ts
│   │
│   ├── statistics/           # Category breakdowns, charts & % monthly costs
│   │   ├── components/       # CategoryBreakdown, CostDistributionBar
│   │   └── utils/            # statisticsMath.ts
│   │
│   └── navigation/           # App navigation & bottom tab bar
│       ├── components/       # BottomNavBar.tsx, TopHeader.tsx
│       └── types/            # TabType ('home' | 'calendar' | 'cards' | 'stats' | 'settings')
│
├── pages/                    # Screen level views (orchestrate feature components)
│   ├── home/HomePage.tsx
│   ├── calendar/CalendarPage.tsx
│   ├── cards/CardsPage.tsx
│   ├── statistics/StatisticsPage.tsx
│   └── settings/SettingsPage.tsx
│
└── shared/                   # Generic code that has NO domain knowledge
    ├── ui/                   # Reusable UI primitives (Button, Modal, BottomSheet, Input, Badge)
    ├── lib/                  # General utilities (formatters, dates, storage helpers)
    ├── types/                # Universal shared TypeScript types
    └── assets/               # Static logos, vector icons, preset brand SVGs
```

---

## 3. Data Models (Domain Entities)

All domain types are strictly typed in `src/shared/types/index.ts`:

### A. Subscription Entity

```typescript
export type BillingCycle = 'weekly' | 'monthly' | 'quarterly' | 'biannual' | 'yearly'

export interface Subscription {
  id: string // UUID v4
  name: string // e.g. "Netflix Standard"
  description?: string
  price: number // e.g. 15.99
  currency: string // ISO 4217, e.g. "USD", "EUR", "ARS"
  billingCycle: BillingCycle // Frequency
  firstBillDate: string // "YYYY-MM-DD"
  nextBillDate: string // Calculated dynamically based on billingCycle & firstBillDate
  categoryId: string // Reference to Category.id
  paymentMethodId?: string // Reference to PaymentMethod.id (Card / Bank)
  reminderDaysBefore?: number // Notification trigger (e.g. 1 or 2 days prior)
  iconUrl?: string // Preset SVG or custom uploaded icon
  brandColor?: string // Hex accent for the card background
  isActive: boolean // Can be paused without deleting
  notes?: string
  createdAt: string
}
```

### B. Payment Method (Cards / Accounts)

```typescript
export type PaymentMethodType = 'credit' | 'debit' | 'bank_account' | 'cash' | 'other'
export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'generic'

export interface PaymentMethod {
  id: string
  name: string // e.g. "Nubank Mastercard", "Main Checking"
  type: PaymentMethodType
  last4?: string // e.g. "4582"
  expiryDate?: string // "MM/YY" - used for expiration reminders on calendar
  brand: CardBrand
  colorGradient: string // e.g. "from-purple-600 to-indigo-800"
}
```

### C. Category

```typescript
export interface Category {
  id: string
  name: string // e.g. "Entertainment", "Work", "Utilities"
  icon: string // Icon identifier
  color: string // Hex or Tailwind color token
}
```

### D. Currency & Preferences

```typescript
export interface CurrencyConfig {
  code: string // "USD", "EUR", "ARS", etc.
  symbol: string // "$", "€", "AR$"
  name: string // "US Dollar", "Euro"
}

export interface AppSettings {
  primaryCurrency: string // Base currency for total sums
  favoriteCurrencies: string[] // 5 pinned currencies in top switch
  theme: 'dark' | 'light' | 'system'
  reminderTime: string // "09:00"
  notificationsEnabled: boolean
}
```

---

## 4. State Management Strategy & Educational Progression

### Phase 1: Native React (Current)

- Custom hooks (`useSubscriptions`, `useCards`, `useSettings`) managing state with `useState` and syncing via `localStorage`.
- Storage logic is isolated into `src/shared/lib/storage.ts`.
- **Benefit:** Direct understanding of state lifecycles, re-renders, and custom hook composition.

### Phase 2: Lightweight Store (`zustand`)

- When ready, migrating is a 1:1 replacement: the hooks simply delegate to `useSubscriptionStore` without touching any UI component!
- **Why Zustand is great for this app:**
  - No Redux boilerplate (`actions`, `reducers`, `dispatch`).
  - Out-of-the-box `persist` middleware.
  - Zero component re-renders for unselected state slices.

---

## 5. Storage & Google Drive Backup Strategy

### Local Storage Schema

Data is saved under versioned keys:

- `aldia_subscriptions_v1`
- `aldia_cards_v1`
- `aldia_categories_v1`
- `aldia_settings_v1`

### Backup JSON Format

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

- **Drive Sync:** The user will authorize with Google OAuth2. The app simply uploads this versioned JSON blob to an app-private `appDataFolder` on Google Drive, requiring zero external database hosting.

---

## 6. How to Add a New Feature Without Spaghetti Code

When you want to build a new screen or component:

1. **Define Types First:** Add your interfaces to `src/features/<feature>/types/`.
2. **Create Pure Utilities:** Put math, formatters, and data transformation in `src/features/<feature>/utils/`.
3. **Build UI Primitives in `shared/ui/`:** If you need a reusable badge, switch, or button, create it in `src/shared/ui/`.
4. **Create Domain Components:** Build feature components in `src/features/<feature>/components/`.
5. **Assemble in `pages/`:** The page file only imports and arranges the feature components.
