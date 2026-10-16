# Aldia

> A subscription & recurring expense tracker for Android (desktop later).
> Track what you pay, where it goes, and when it's due. Offline, private, no account.

Aldia answers three questions at a glance: **how much do I spend per month**, **where does the money go** (by category), and **when is the next charge**. It is inspired by [Tilla](https://play.google.com/store/apps/details?id=com.pavelrekun.tilly) (Android) and [SubscriptionDay](https://apps.apple.com/app/id1638498952) (iOS), with everything stored on the phone.

It is a portfolio and learning project first: for now it is shared with family and friends. Product details live in [`PRODUCT.md`](PRODUCT.md), the code structure in [`docs/architecture.md`](docs/architecture.md).

---

## What works today

- **Home:** monthly total, subscription list filtered by category, swipe to delete with undo.
- **Add a subscription:** 51 presets (streaming, AI, gaming, utility bills searchable by company, e.g. "Edenor") or a custom one.
- **The form:** name, price, currency, billing cycle (one-time, or every N days / weeks / months / years), free trial, start and end dates, category.
- **Categories:** 12 defaults plus your own (create, rename, delete; deleted ones fall back to "Otros").
- **Detail screen:** view, edit, pause/resume and delete a subscription.

Not built yet: Calendar, Statistics, Cards and Settings screens (placeholders), reminders, JSON export/import, the Android build.

---

## Tech Stack

| Layer            | Technology                                                        |
| ---------------- | ----------------------------------------------------------------- |
| **UI Framework** | React 19 + TypeScript 6                                           |
| **Build Tool**   | Vite 8                                                            |
| **Mobile Shell** | Capacitor 8 (installed; the Android platform is not set up yet)   |
| **State**        | Zustand 5 (`persist` middleware for subscriptions and categories) |
| **Styling**      | SCSS Modules + design tokens in CSS custom properties             |
| **Animation**    | motion 14                                                         |
| **Icons/Assets** | Custom SVG icon set, flag-icons, `.webp` brand logos              |
| **Code Quality** | ESLint 10 · Prettier 3 · Conventional Commits (Commitizen)        |

### Decisions and why

- **React + Capacitor** instead of React Native: one web codebase ships as an Android app today and can become a desktop app (Electron or Tauri) later without a rewrite.
- **Zustand** instead of Redux: a single-user offline app needs small stores, not actions and reducers. `persist` saves them to storage for free.
- **SCSS Modules** instead of Tailwind (Tailwind was removed): every component owns its styles, JSX stays readable, and themed pseudo-elements and keyframes are easy.
- **Billing cycle as data**, `{ type: 'every', interval, unit }`, instead of a fixed list of names: "every 2 months" or "every 15 days" need no new code.
- **Dates as `YYYY-MM-DD` strings in local time**, never `toISOString()`: no time zone can move a charge to the day before.
- **Shared field wiring** (`useFieldControl`): every input gets the same ids, accessibility links and error shake from one place.

---

## Getting Started

### Prerequisites

- Node.js 20+ and npm 10+
- Android Studio, for the Android build (not needed for the web dev server)

### Development

```bash
npm install        # install dependencies
npm run dev        # dev server (add --host to open it on a phone in the same network)
npm run lint       # ESLint
npm run format     # Prettier
npm run build      # type check + production build
```

### Android (not set up yet)

```bash
npx cap init                       # first time only
npx cap add android                # first time only
npm run build && npx cap sync      # copy the web build into the native project
npx cap open android               # open in Android Studio
```

---

## Roadmap

### v1.0 — MVP: the first build for testers

- [x] Preset picker and custom subscriptions
- [x] Add, view, edit, pause and delete subscriptions
- [x] Categories with create / rename / delete
- [x] Monthly total that respects billing cycle and currency (daily exchange rates, cached)
- [ ] Initialize the Capacitor Android platform
- [ ] Local notifications before each charge (Capacitor Local Notifications)
- [ ] JSON export/import (the only backup until Drive sync)

### v1.x — The other screens

- [ ] Calendar with charge days
- [ ] Statistics by category
- [ ] Cards: payment methods with expiry dates
- [ ] Settings: favorite currencies, theme, export/import

### Later

- Google Drive backup, income and expenses, couple mode, desktop build. See `PRODUCT.md`.

---

## Conventions

- **Branches:** `feature/*` (or `fix/*`, `chore/*`) → pull request into `dev` → `main` for stable releases.
- **Commits:** Conventional Commits (`feat(scope): ...`, `fix`, `refactor`, `style`, `docs`, `chore`); `npm run commit` opens Commitizen.
- **Files:** PascalCase folder + file per component (`Button/Button.tsx` + `Button.module.scss`), camelCase for hooks and utils (`useShake.ts`, `isoDate.ts`).
- **Imports:** `@/` maps to `src/`.
- **Docs in code:** exported helpers, hooks and component props carry JSDoc (`/** ... */`), so hovering explains them.

---

## License

Private project, not open source.
