# Product

## Platform

Android (portrait). Desktop (Electron or Tauri) later, so the web codebase must stay portable.

## Users

Primary: the developer and a close circle of family & friends who want to track recurring costs and know when charges are coming. Android users with varying tech literacy.

Future: public Android users through Google Play, once the app has its own distinguishing features (see "Before a store release").

## Product Purpose

Aldia is an offline-first subscription and recurring expense tracker. It answers three questions at a glance: **how much am I spending per month**, **where is the money going** (by category), and **when is the next charge** (by calendar day).

Success means a user opens the app once a month, sees their total, checks upcoming charges, and feels in control of their recurring expenses, without an account or a server.

## Positioning

Unlike SubscriptionDay (iOS only, cloud-dependent) and Tilla (limited customization), Aldia is:

- **Local-first and private:** all data on the device, no account. The only network request is a daily download of public exchange rates; no user data is sent.
- **Preset-rich:** 51 presets, including utility bills searchable by company name ("Edenor", "Metrogas"), so users mostly fill the price and the date.
- **Multi-currency aware:** each subscription keeps its own currency; the home total converts to the currency the user picks.
- **Category-driven statistics:** where the money goes, as percentages.
- **Payment method tracking:** cards and bank accounts (visual only) with expiry reminders on the calendar.

## Operating Context

Typical flow:

1. Open the app → see the monthly total and the subscription list on Home.
2. Tap `+` → pick a preset or create a custom one → fill the form → save.
3. Tap a subscription → see its details → edit, pause or delete it.
4. Calendar → which days have charges this month → tap a day for details.
5. Statistics → category percentages, annual forecast.
6. Cards → which card or account pays what.
7. Settings → currencies, theme, export/import.

The app language is **Spanish** (UI copy: "Agregar Subscripción", "Formato del cobro", "Categoría"...). English comes later, picked from the system language or from Settings.

## Capabilities and Constraints

### v1 capabilities

- Subscriptions: add from presets or custom, view, edit, pause/resume, delete with undo.
- Billing cycles: every N days / weeks / months / years. Free trials with their own length, starting on any date. One-time payments are hidden in the form (kept in the data model for the future income and expenses book; a subscription already saved as one-time can keep it).
- Categories: 12 defaults; the user can create, rename and delete (deleted ones fall back to "Otros").
- Multi-currency: price stored in its own currency, converted for the total with daily exchange rates (cached; the last saved rates are used offline).
- Notifications: reminders N days before a charge or a trial end, at a chosen time (local notifications, no server).
- Data: JSON export/import.
- Theme: dark by default, light mode, system detection, manual toggle.
- Later in v1.x: Calendar, Statistics, Cards, Settings screens. Google Drive backup after that.

### Constraints

- Android only for now (iOS only if the app ever pays for it).
- No backend, no user accounts (except optional Google sign-in for Drive backup, later).
- No real payment processing: cards and accounts are visual only.
- Spanish UI, no i18n framework yet.
- **Storage durability:** the data lives as JSON files in the app's private folder (not in the WebView's `localStorage`, which the phone can clear), with crash-safe writes, and is included in Android's automatic backup. It is deleted if the app is uninstalled, so JSON export is still needed as the backup the user controls.

### Monetization (undecided)

No paywall in v1: everything is unlocked. If a freemium tier comes later, the rule is **recording your real bills is always free** (every billing cycle, trials, categories), because a total that can't include a bimonthly bill is a wrong total. Candidates for a paid tier: more than one reminder per subscription, Drive sync, extra themes, statistics history, couple mode. Pricing model (one-time vs subscription) is open.

### Before a store release

- **Brand logos:** the presets ship real company logos. That is fine for a private build, but on Google Play trademarks are what get apps removed. Keep the names, replace the logos with generic or user-picked icons.
- **Distinguishing features:** still to decide. Ideas in the long-term plan: income and expenses book, couple mode with split subscriptions, "which card is cheapest" for a purchase.

## Brand Commitments

- **Name:** Aldia
- **Palette:** Phthalo greens (brand), Champagne golds (accents), Paper (light mode), Charcoal (dark mode). A full palette revision is planned.
- **Font:** Red Hat Text, Light 300 and Regular 400 (as in Figma).
- **Visual identity:** premium, sleek, clean, mobile-native. Touch-first gestures (drag bottom sheets, swipe cards, ripple buttons).
- **Tone:** friendly, clear, Spanish UI copy.

## Evidence on Hand

- Figma file "Financial Tracker" with screens for Home, Add Subscription (preset picker, form, every bottom sheet), Calendar and Statistics.
- Working codebase: React 19 + Vite 8 + Zustand 5 + SCSS Modules, running on Android through Capacitor 8.
- 51 presets, 12 default categories, 5 default currencies (USD, EUR, ARS, CLP, GBP).
- Shared UI: Button, Field with Input Text / Amount / Number / Select / Date, Switch, BottomSheet, DatePicker, CurrencyPicker, Avatar, Pill, Toast, Typography.
- No real user testimonials or external content yet.

## Product Principles

1. **Privacy by default:** data never leaves the device unless the user exports or syncs it.
2. **Glanceable value:** Home answers "how much am I spending?" in under 2 seconds.
3. **Low friction entry:** presets remove most typing; adding a subscription takes under 30 seconds.
4. **Honest simplicity:** show what matters, hide what doesn't. No dashboard overload.
5. **Honest numbers:** totals never pretend; when rates are old or missing, the app says so.
6. **Portable foundation:** a clean web app that works on Android today and desktop tomorrow.
