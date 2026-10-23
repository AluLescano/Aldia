// DEPENDENCIES
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig } from 'motion/react'
import { SystemBars, SystemBarsStyle } from '@capacitor/core'

// COMPONENTS
import App from './App.tsx'

// STORES
import { useCategoryStore } from './features/categories/store/categoryStore'
import { useSettingsStore } from './features/settings/store/settingsStore'
import { useSubscriptionStore } from './features/subscriptions/store/subscriptionStore'

// UTILS
import { clearLegacyStorage } from './shared/lib/legacyStorage'
import { startNotificationSync } from './features/notifications/notificationSync.ts'

// ASSETS: global styles, loaded once for the whole app
// The app's font, bundled: works offline and never calls Google Fonts
import '@fontsource-variable/red-hat-text'
import './styles/_themes.scss'
import 'flag-icons/css/flag-icons.min.css'
import './index.css'

/* Android colors the system bar icons by the phone’s dark mode, not the app’s theme, so we tell it which one we’re using. */
const theme = document.documentElement.dataset.theme
const style = theme === 'light' ? SystemBarsStyle.Light : SystemBarsStyle.Dark
SystemBars.setStyle({ style })

// Drop the old build's localStorage data, once per start, before any store touches storage
clearLegacyStorage()

/*
 * Load the saved data from the files before anything renders. The stores skip their own
 * automatic load (`skipHydration`): if a save happened before this finished, it would write
 * the empty defaults over the user's files.
 */
await Promise.all([
  useSubscriptionStore.persist.rehydrate(),
  useCategoryStore.persist.rehydrate(),
  useSettingsStore.persist.rehydrate(),
])

// The stores are loaded: keep the phone's notifications in sync from now on
startNotificationSync()

/**
 * Entry point: mounts the app in `#root` (index.html). `StrictMode` runs some checks
 * twice in development only, to surface bugs early; it does nothing in the real build.
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Motion follows the phone's "reduce motion" setting, like the CSS reset does */}
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </StrictMode>,
)
