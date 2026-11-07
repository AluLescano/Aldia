# Aldia

> A subscription & recurring expense tracker for Android (desktop later).
> Track what you pay, where it goes, and when it's due. Offline, private, no account.

Aldia answers three questions at a glance: **how much do I spend per month**, **where does the money go** (by category), and **when is the next charge**. It is inspired by [Tilla](https://play.google.com/store/apps/details?id=com.pavelrekun.tilly) (Android) and [SubscriptionDay](https://apps.apple.com/app/id1638498952) (iOS), with everything stored on the phone.

It is a portfolio and learning project first: for now it is shared with family and friends. Product details live in [`PRODUCT.md`](PRODUCT.md), the code structure in [`docs/architecture.md`](docs/architecture.md).

---

## What works today

- **Home:** monthly total (other currencies converted with daily exchange rates, the last saved ones when offline), the list filtered by category or by "Inactivas" (paused and ended), sorted by next charge, name or price (the pick is remembered), swipe to delete with undo.
- **Cards:** each one shows the monthly price, the same number the total uses, with the real charge underneath when it's different ("$ 8.500 al año").
- **Add a subscription:** 51 presets (streaming, AI, gaming, utility bills searchable by company, e.g. "Edenor") or a custom one.
- **The form:** name, price, currency, billing cycle (every N days / weeks / months / years), free trial (from any start date), start and end dates, category, and up to 3 notifications (N days before each charge).
- **Price changes:** changing the price of a subscription that was already charged asks "¿Desde cuándo?", so past charges keep the price that was really paid.
- **End dates:** once a subscription ends it leaves the total, moves to "Inactivas" and its card says "Terminó el …".
- **Reminders:** real phone notifications N days before each charge, at 9:00. They're planned 60 days ahead and refreshed whenever a subscription changes or the app comes back to the screen. The first-open welcome asks for the permission.
- **Categories:** 12 defaults plus your own (create, rename, delete; deleted ones fall back to "Otros").
- **Detail screen:** view, edit, pause/resume and delete a subscription.
- **Calendario:** the month's real charges (a yearly charge counts whole on its month) in the currency you pick, a grid with each day's logos, free trial days tinted champagne, and a sheet per day with its charges, trials and total. Tap a charge to edit it, or add a subscription starting on an empty day.

- **Android:** runs on the phone (Capacitor), with safe areas, the back button and system bar colors handled. Data is saved as files in the app's private folder, with a version number, so data from an older version is upgraded on the first open.

Not built yet: Statistics ("Resumen"), Cards and Settings screens (placeholders), picking the reminder time (fixed at 9:00 until Settings exists), JSON export/import.

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
- **Price history instead of one price:** each subscription keeps `priceHistory` (every price with the date it starts) and its `pauses`, so a price rise never rewrites what past charges cost, and the calendar shows which charges a pause skipped.
- **Versioned saved data:** the subscriptions file carries a version number and a `migrate` step (Zustand `persist`), so a new data shape upgrades what's already on the testers' phones instead of breaking it.
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

**Release builds** are signed with a keystore that never enters the repo. Gradle reads its path and passwords from `android/keystore.properties` (gitignored, like `*.jks`):

```properties
storeFile=C:/path/to/your-release.jks
storePassword=...
keyAlias=...
keyPassword=...
```

Then `cd android && ./gradlew assembleRelease` builds `app/build/outputs/apk/release/app-release.apk`. Without that file the release build comes out unsigned. Testers only ever get signed release builds: an APK signed with another key can't update the installed app, so switching keys means an uninstall.

**Versions** live only in `package.json`: Gradle reads `versionName` from it and builds `versionCode` as `major * 10000 + minor * 100 + patch` (0.2.1 → 201), so every release must raise the version. Bump it with `npm run release:patch` (fixes) or `npm run release:minor` (new features) on the release branch; the tag goes on `main`.

### Releasing

1. On a `chore/*` branch off `dev`: `npm run release:patch` (or `release:minor`), commit `chore: release X.Y.Z`, PR into `dev`.
2. PR `dev` → `main` titled `Release X.Y.Z`, merge it, then `git switch main` and `git pull`.
3. `npm run release:tag`: checks you are on an up-to-date, clean `main` and the tag is new, then creates and pushes `vX.Y.Z`.
4. `npm run release:apk`: builds the signed APK and copies it to `release/aldia-X.Y.Z.apk` (gitignored). It prints the path and, on Windows, opens the folder. It warns if the commit isn't the tag: that APK is only for testing.
5. On GitHub, Releases → Draft a new release → pick the tag, write the notes, attach the APK, tick "Set as a pre-release" while Aldia is in alpha.

---

## Roadmap

### v1.0 — MVP: the first build for testers

- [x] Preset picker and custom subscriptions
- [x] Add, view, edit, pause and delete subscriptions
- [x] Categories with create / rename / delete
- [x] Monthly total that respects billing cycle and currency (daily exchange rates, cached)
- [x] Initialize the Capacitor Android platform
- [x] Data saved as files on the device, safe against crashes
- [x] Local notifications before each charge (Capacitor Local Notifications)
- [x] First-open welcome: what Aldia is for, the notifications permission, the privacy promise
- [x] Sort the list; monthly prices on the cards
- [x] Price history, pauses and end dates (saved data v2, upgraded automatically)
- [ ] JSON export/import (the only backup until Drive sync)

### v1.x — The other screens

- [x] Calendar with charge days
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
