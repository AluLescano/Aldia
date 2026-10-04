# Product

<!-- impeccable:product-schema 1 -->

## Platform

android

## Users

Primary: The developer (personal use) and a close circle of family & friends who want to track recurring subscription costs and know when charges are coming. All Android users with varying tech literacy.

Future: Public Android users discovered via Google Play, once the app has differentiated enough from SubscriptionDay to avoid takedown risk.

## Product Purpose

Aldia is an offline-first subscription and recurring expense tracker for Android. It answers three questions at a glance: **how much am I spending per month**, **where is the money going** (by category), and **when is the next charge** (by calendar day).

Success means a user opens the app once a month, sees their total, checks upcoming charges, and feels in control of their recurring expenses — without needing an account, an internet connection, or a server.

## Positioning

Unlike SubscriptionDay (iOS-only, cloud-dependent) and Tilla (limited customization), Aldia is:

- **Local-first and private** — all data on device, optional Google Drive JSON backup, no account required.
- **Preset-rich** — 17+ popular services pre-loaded so users only fill price, date, and category.
- **Multi-currency aware** — 5 favorite currencies with quick-switch on the home screen; critical for users who pay in USD, EUR, and local currency.
- **Category-driven statistics** — visual percentage breakdown of where the money goes.
- **Payment method tracking** — mock credit cards and bank accounts with expiry date reminders on the calendar.

The app must develop distinguishing features beyond SubscriptionDay before Google Play release to avoid being flagged as a clone.

## Operating Context

Users interact with the app on Android phones (portrait only). Typical flow:

1. Open app → see monthly total and subscription list on Home screen.
2. Tap `+` → pick from preset services or create custom → fill form fields → save.
3. Switch to Calendar → see which days have charges this month → tap a day for details.
4. Check Statistics → see donut chart of category percentages → see annual forecast.
5. Manage payment methods in Cards screen → see which card is being charged where.
6. Settings → switch currency, change theme, export/import JSON backup.

The app language is **Spanish** (UI copy: "Agregar Subscripción", "Formato del cobro", "Categorías", etc.) but will develop at least English format later on, selectable from settings and checked from the user system.

## Capabilities and Constraints

### Confirmed Capabilities (v1)
- Subscription CRUD: add from presets (17+), create custom, edit, pause, cancel, delete.
- Billing cycles (free tier): weekly, monthly, yearly.
- Billing cycles (paid unlock, gated later): one-time, bimonthly, semiannual, trial periods.
- Multi-currency: 5 favorites configurable in settings, quick-switch pill on home screen.
- Calendar: monthly grid with charge day markers, tap-to-see-details bottom sheet, card expiry markers.
- Statistics: category percentage donut chart, annual cost forecast, subscription count.
- Payment methods: mock credit cards (Visa, Mastercard, Amex, Discover) with expiry tracking and bank accounts.
- Categories: 1–2 default templates, user can edit/add custom categories.
- Notifications: configurable reminders (N days before charge, at specific time).
- Data: JSON export/import, Google Drive appDataFolder backup (v1.1).
- Theme: dark mode default, system preference detection, manual toggle.

### Constraints
- Android only (iOS will be published if app is profitable later on).
- 100% local storage (localStorage via Capacitor, no backend server).
- Freemium model planned but **no paywall in v1** — all features unlocked; gate added later.
- No real payment processing — cards/accounts are visual mock representations only.
- No user accounts or authentication (except optional Google OAuth for Drive backup).
- Spanish-language UI (no i18n framework yet; localization is a future concern).
- Desktop version (Electron or Tauri) planned for v2 — the web codebase must remain portable.

### Undecided
- Freemium pricing model (one-time purchase vs subscription).
- Google Play listing timeline.
- Distinguishing features for store release.

## Brand Commitments

- **Name:** Aldia
- **Palette:** Phthalo greens (brand primary), Champagne golds (accents), Paper (light mode), Charcoal (dark mode).
- **Font:** Red Hat Text (300–700 weights).
- **Visual identity:** Premium, sleek, clean, mobile-native feel — not a cheap wrapper. Touch-first with native-feeling gestures (drag bottom sheets, ripple buttons).
- **Tone:** Friendly, clear, Spanish-language UI copy.

## Evidence on Hand

- Figma design file with screens for: Home (empty + populated), Add Subscription (preset picker, form, selectors), Calendar (grid + day details sheet), Statistics (donut chart), and all bottom sheet sub-flows (datepicker, billing format, notifications, categories, payment methods).
- Working partial codebase: React 19 + Vite 8 + Capacitor 8 + Zustand 5 + Tailwind v4 + SCSS Modules.
- 17 preset subscription services defined in code.
- 8 default categories defined in code.
- 5 default currencies defined in code (USD, EUR, ARS, CLP, GBP).
- Shared UI primitives built: Button (ripple), BottomSheet (touch drag), Typography (currency formatting), Pill, BackdropFilter.
- No real user testimonials, case studies, or external content to display.

## Product Principles

1. **Privacy by default** — data never leaves the device unless the user explicitly exports or syncs.
2. **Glanceable value** — the home screen answers "how much am I spending?" in under 2 seconds.
3. **Low friction entry** — presets eliminate most typing; a subscription can be added in under 30 seconds.
4. **Honest simplicity** — show what matters, hide what doesn't. No dashboard overload.
5. **Portable foundation** — the codebase must remain a clean web app that works on Android today and desktop tomorrow.
