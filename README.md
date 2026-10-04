# Aldia

> A subscription & recurring expense tracker built for Android (with future desktop support).
> Track what you pay, where it goes, and when it's due — all offline, all private.

Aldia is inspired by [Tilla](https://play.google.com/store/apps/details?id=com.pavelrekun.tilly) (Android) and [SubscriptionDay](https://apps.apple.com/app/id1638498952) (iOS), with the goal of creating a polished, independent alternative for Android users that stores everything locally and syncs optionally via Google Drive.

---

## Tech Stack

| Layer            | Technology                                                           |
| ---------------- | -------------------------------------------------------------------- |
| **UI Framework** | React 19 + TypeScript 6                                              |
| **Build Tool**   | Vite 8                                                               |
| **Mobile Shell** | Capacitor 8 (Android)                                                |
| **State**        | Zustand 5 (lightweight, slice-based stores with `persist` middleware) |
| **Styling**      | Tailwind CSS v4 + SCSS Modules (design tokens in CSS Custom Props)   |
| **Icons/Assets** | flag-icons (currency flags), custom SVGs                             |
| **Code Quality** | ESLint 10 · Prettier 3 · Commitizen (Conventional Commits)          |

### Why this stack?

- **React + Capacitor** lets us write a single web codebase and ship it as a native Android app using Capacitor's native bridge. Unlike React Native, the same codebase can later target **desktop via Electron or Tauri** with zero rewrite.
- **Zustand** over Redux because this is a single-user, offline app — Zustand's minimal API (`create` + slices) eliminates boilerplate while providing fine-grained reactivity.
- **Tailwind + SCSS Modules** — Tailwind handles layout/spacing/responsive, while SCSS Modules handle complex component-scoped styles (animations, pseudo-elements, theme-aware keyframes) that are awkward in utility classes.

---

## Features (v1 Scope)

### Core Screens

| Screen         | Description                                                                                                    | Status         |
| -------------- | -------------------------------------------------------------------------------------------------------------- | -------------- |
| **Home**       | Filterable subscription card list + monthly cost summary with currency switcher                                 | 🟡 In Progress |
| **Calendar**   | Monthly grid showing charge days for each subscription + card expiry dates                                      | 🔴 Placeholder |
| **Statistics** | Category breakdown — pie/donut chart showing % of monthly cost per category                                    | 🔴 Placeholder |
| **Cards**      | Mock credit cards & bank accounts — visual display of where each sub is charged, with expiry date tracking     | 🔴 Placeholder |
| **Settings**   | Currency preferences (5 favorites + active), theme toggle, Google Drive backup, JSON export/import             | 🔴 Placeholder |

### Feature Details

- **Subscription Management**
  - Add from 17+ preset services (Netflix, Spotify, ChatGPT Plus, Claude Pro, etc.) — user only fills day, price, category, payment method
  - Create fully custom subscriptions with name, icon, brand color
  - Track billing cycle: one-time, weekly, monthly, bimonthly, semiannual, yearly
  - Support for trials with start/end dates
  - Pause, cancel, or reactivate subscriptions without deleting

- **Multi-Currency**
  - 5 favorite currencies configurable from settings (default: USD, EUR, ARS, CLP, GBP)
  - Quick-switch active currency from home screen pill
  - All totals recalculated in the selected display currency

- **Payment Methods**
  - Add mock credit cards (Visa, Mastercard, Amex, Discover) or bank accounts
  - Visual card component with gradient, last 4 digits, and expiry
  - Expiry dates appear in Calendar view as visual reminders

- **Calendar View**
  - Monthly grid with dots/markers on charge days
  - Tap a day to see which subscriptions are due
  - Card expiry dates shown as special markers

- **Statistics**
  - Category-based expense breakdown (% of total monthly cost)
  - Visual chart (pie/donut or bar)

- **Data & Privacy**
  - 100% local storage (localStorage with versioned keys)
  - JSON export/import for manual backups
  - Google Drive sync to `appDataFolder` (planned v1.1)

---

## Architecture

This project follows a **Feature-Driven Architecture**. Full details in [`docs/architecture.md`](docs/architecture.md).

```
src/
├── app/                        # Global providers & app-level wrappers
├── features/                   # Domain modules (each owns its components, hooks, types, utils)
│   ├── homepage/               # Monthly expenses widget, subscription list
│   ├── subscriptions/          # (planned) Subscription CRUD, preset picker, form
│   ├── cards/                  # (planned) Payment method management
│   ├── calendar/               # (planned) Calendar grid, date projections
│   ├── statistics/             # (planned) Category breakdowns, charts
│   ├── settings/               # Currency store, preferences
│   └── navigation/             # Bottom tab bar
├── pages/                      # Screen-level orchestrators (import + compose features)
├── shared/
│   ├── ui/                     # Reusable primitives: Button, BottomSheet, Pill, Typography
│   ├── lib/                    # Pure utilities: storage, currencies, presets
│   └── types/                  # Domain interfaces & type definitions
└── styles/                     # Design tokens (_variables.scss) + themes (_themes.scss)
```

### Key Principles

1. **Separation of Concerns** — UI components never touch storage or do calculations directly. Logic lives in hooks/utils, data in stores.
2. **Local-First** — All data on device. No backend server. Optional Google Drive sync uploads a versioned JSON blob.
3. **Mobile-Native Feel** — 48px touch targets, safe area insets, bottom sheets for contextual actions, gesture-driven interactions.

---

## Design System

### Color Palette

| Token Family  | Purpose                        | Example                       |
| ------------- | ------------------------------ | ----------------------------- |
| **Phthalo**   | Brand greens (primary actions)  | `$phthalo-600: #0a3d2c`      |
| **Champagne** | Gold accents (premium feel)     | `$champagne-200: #e8d5a8`    |
| **Paper**     | Light mode warm neutrals        | `$paper-0: #fffdf9`          |
| **Charcoal**  | Dark mode neutrals              | `$charcoal-900: #0a0f0c`     |

### Theme Support

- **Light mode** (`:root`) and **Dark mode** (`[data-theme='dark']`)
- All component styles reference semantic CSS variables (`--bg-surface`, `--text-primary`, `--brand-primary`, etc.) — never raw color values

### Typography

- Font: **Red Hat Text** (300–700 weights)
- Specialized `currency` variant splits integer/decimal for financial display emphasis

### Shared UI Components (Built)

| Component        | Description                                               |
| ---------------- | --------------------------------------------------------- |
| `Button`         | Primary/Secondary variants with ripple effect animation   |
| `BottomSheet`    | Portal-rendered modal with touch drag gestures            |
| `BackdropFilter` | Blur overlay for modals                                   |
| `Pill`           | Clickable rounded chip for filters and selections         |
| `Typography`     | Semantic text with `title`, `body`, `overline`, `currency` variants |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- Android Studio (for Capacitor builds)

### Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Lint
npm run lint

# Format
npm run format

# Build for production
npm run build

# Commit (conventional commits via Commitizen)
npm run commit
```

### Mobile (Android)

```bash
# Initialize Capacitor (first time)
npx cap init

# Add Android platform
npx cap add android

# Sync web build to native project
npm run build && npx cap sync

# Open in Android Studio
npx cap open android
```

---

## Local Storage Schema

Data is stored under versioned keys to support future migrations:

| Key                        | Contents                            |
| -------------------------- | ----------------------------------- |
| `aldia_settings`           | Currency prefs, theme, reminders    |
| `aldia_subscriptions_v1`   | All subscription records            |
| `aldia_cards_v1`           | Payment methods                     |
| `aldia_categories_v1`      | Custom + default categories         |

---

## Roadmap

### v1.0 — MVP (Current)
- [ ] Subscription CRUD (add from presets + custom creation)
- [ ] Filterable subscription list with category pills
- [ ] Monthly cost calculation with multi-currency display
- [ ] Calendar view with charge day markers
- [ ] Statistics screen with category % breakdown
- [ ] Payment method cards with expiry tracking
- [ ] Settings: currency favorites, theme toggle
- [ ] JSON export/import

### v1.1 — Sync & Polish
- [ ] Google Drive backup sync (OAuth2 + appDataFolder)
- [ ] Subscription reminders / notifications (via Capacitor Local Notifications)
- [ ] Onboarding flow for first-time users
- [ ] Subscription detail view / edit screen

### v2.0 — Desktop & Differentiation
- [ ] Desktop build (Electron or Tauri)
- [ ] Unique features to distinguish from SubscriptionDay
- [ ] Potential Google Play Store release

---

## Project Structure Conventions

- **Commits**: Conventional Commits via Commitizen (`npm run commit`)
- **Branches**: `main` (stable) → feature branches (`feat/subscription-form`, `fix/currency-picker`)
- **File naming**: PascalCase for components (`Button.tsx`), camelCase for utils (`storage.ts`), kebab-case for style files when needed
- **Imports**: Use `@/` path alias (maps to `src/`)

---

## License

Private project — not open source. Distributed among family & friends.
