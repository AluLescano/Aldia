# Aldia

> A subscription & recurring expense tracker for Android (desktop later).
> Track what you pay, where it goes, and when it's due. Offline, private, no account.

Aldia answers three questions at a glance: **how much do I spend per month**, **where does the money go** (by category), and **when is the next charge**. It is inspired by [Tilla](https://play.google.com/store/apps/details?id=com.pavelrekun.tilly) (Android) and [SubscriptionDay](https://apps.apple.com/app/id1638498952) (iOS), with everything stored on the phone.

It is a portfolio and learning project first: for now it is shared with family and friends. Product details live in [`PRODUCT.md`](PRODUCT.md), the code structure in [`docs/architecture.md`](docs/architecture.md).

---

## What works today

- **Home:** monthly total, subscription list filtered by category, swipe to delete with undo.
- **Add a subscription:** 51 presets (streaming, AI, gaming, utility bills searchable by company, e.g. "Edenor") or a custom one.
- **The form:** name, price, currency, billing cycle (every N days / weeks / months / years), free trial (from any start date), start and end dates, category, and up to 3 notifications (N days before each charge).
- **Categories:** 12 defaults plus your own (create, rename, delete; deleted ones fall back to "Otros").
- **Detail screen:** view, edit, pause/resume and delete a subscription.

- **Android:** runs on the phone (Capacitor), with safe areas, the back button and system bar colors handled. Data is saved as files in the app's private folder.

Not built yet: Calendar, Statistics, Cards and Settings screens (placeholders), the notifications actually ringing on the phone (they're set up in the form, not scheduled yet), JSON export/import.

---

## Tech Stack

| Layer            | Technology                                                    |
| ---------------- | ------------------------------------------------------------- |
| **UI Framework** | React 19 + TypeScript 6                                       |
| **Build Tool**   | Vite 8                                                        |
| **Mobile Shell** | Capacitor 8 (Android)                                         |
| **State**        | Zustand 5, saved with `persist` into JSON files on the device |
| **Storage**      | Capacitor Filesystem (the app's private folder)               |
| **Tests**        | Vitest                                                        |
| **Styling**      | SCSS Modules + design tokens in CSS custom properties         |
| **Animation**    | motion 14                                                     |
| **Icons/Assets** | Custom SVG icon set, flag-icons, `.webp` brand logos          |
| **Code Quality** | ESLint 10 · Prettier 3 · Conventional Commits (Commitizen)    |

### Decisions and why

- **React + Capacitor** instead of React Native: one web codebase ships as an Android app today and can become a desktop app (Electron or Tauri) later without a rewrite.
- **Zustand** instead of Redux: a single-user offline app needs small stores, not actions and reducers. `persist` saves them to storage for free.
- **JSON files in the app's private folder** instead of `localStorage`: the system can clear the WebView's storage, while the app's own files stay until the user clears the app's data or uninstalls it. Each save writes a temporary file and swaps it in, so a crash never leaves half a file (details in `docs/architecture.md`).
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
npm test           # Vitest
npm run build      # type check + production build
```

### Android

Needs Android Studio's SDK, and `JAVA_HOME` pointing at a Java 21 JDK (Capacitor 8's Gradle doesn't run on Java 25).

```bash
npm run build && npx cap sync android   # copy the web build into the native project
npx cap run android                     # build and install on a connected phone
npx cap open android                    # or open it in Android Studio
```

Live reload on the phone: run `npm run dev -- --host` (the `--host` matters on Windows), then `npx cap run android -l --host localhost --port 5173 --forwardPorts 5173:5173`.

---

## Roadmap

### v1.0 — MVP: the first build for testers

- [x] Preset picker and custom subscriptions
- [x] Add, view, edit, pause and delete subscriptions
- [x] Categories with create / rename / delete
- [x] Monthly total that respects billing cycle and currency (daily exchange rates, cached)
- [x] Initialize the Capacitor Android platform
- [x] Data saved as files on the device, safe against crashes
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
