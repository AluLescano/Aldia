// DEPENDENCIES
import { App as CapApp } from '@capacitor/app'
import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { runTopBackHandler } from './shared/hooks/useBackHandler'

// STORES
import { useUIStore } from '@/shared/store/uiStore'
import { useToastStore } from '@/shared/store/toastStore'
import { useRatesStore } from '@/shared/store/ratesStore'
import { useSettingsStore } from '@/features/settings/store/settingsStore'

// COMPONENTS
import BottomNavBar from '@/features/navigation/components/BottomNavBar'
import OnboardingFlow from '@/features/onboarding/components/OnboardingFlow/OnboardingFlow'
import Toast from '@/shared/ui/Toast/Toast'
import Typography from '@/shared/ui/Typography/Typography'

// TYPES
import type { TabType } from '@/shared/types'

// PAGES
import { HomePage } from '@/pages/home/HomePage'
import { CalendarPage } from '@/pages/calendar/CalendarPage'
import { CardsPage } from '@/pages/cards/CardsPage'
import { StatisticsPage } from '@/pages/statistics/StatisticsPage'
import { SettingsPage } from '@/pages/settings/SettingsPage'
import { PresetPicker } from '@/pages/presetPicker/PresetPicker'
import { SubscriptionFormPage } from '@/pages/subscriptionForm/SubscriptionFormPage'

// ASSETS
import styles from './App.module.scss'

// Same order as the nav bar: picking a tab to the right slides the new page in from the right
const TAB_ORDER: TabType[] = ['home', 'calendar', 'statistics', 'cards', 'settings']
const PAGE_SHIFT = 32 // px
const PAGE_MOVE = { duration: 0.25, ease: 'easeOut' } as const

// Material's "shared axis": both pages slide together, but the old one is gone (fast fade)
// before the new one fades in, so their text never shows on top of each other.
// `direction`: 1 when moving right in the nav bar, -1 when moving left
const pageVariants = {
  enter: (direction: number) => ({ x: direction * PAGE_SHIFT, opacity: 0 }),
  center: {
    x: 0,
    opacity: 1,
    transition: { x: PAGE_MOVE, opacity: { duration: 0.15, delay: 0.08 } },
  },
  exit: (direction: number) => ({
    x: direction * -PAGE_SHIFT,
    opacity: 0,
    transition: { x: PAGE_MOVE, opacity: { duration: 0.08 } },
  }),
}

/**
 * The app shell: the active tab with the bottom nav, the top overlay of the
 * `uiStore` stack (preset picker, subscription screen), and the app-wide toast.
 * Also keeps the exchange rates fresh.
 */
function App() {
  const { appContainer, appWrapper, mainContent, page, overlayContainer, srOnly } = styles
  const [activeTab, setActiveTab] = useState<TabType>('home')
  const [direction, setDirection] = useState(1)
  const overlays = useUIStore((state) => state.overlays)
  const showOnboarding = !useSettingsStore((state) => state.hasSeenOnboarding)

  const toast = useToastStore((state) => state.toast)
  const hideToast = useToastStore((state) => state.hideToast)

  // Exchange rates: download once a day, on the first open and whenever the app comes back
  // to the screen (a phone can keep it open across midnight). The store skips it if done today.
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === 'visible')
        useRatesStore.getState().refreshIfStale()
    }
    refresh()
    document.addEventListener('visibilitychange', refresh)
    return () => document.removeEventListener('visibilitychange', refresh)
  }, [])

  const selectTab = useCallback(
    (tab: TabType) => {
      setDirection(TAB_ORDER.indexOf(tab) > TAB_ORDER.indexOf(activeTab) ? 1 : -1)
      setActiveTab(tab)
    },
    [activeTab],
  )

  // Android back button: close the screen on top, change the user to home if in a different tab, or leave the app when there's nothing open
  useEffect(() => {
    const handleBack = () => {
      const { overlays, popOverlay } = useUIStore.getState()

      if (runTopBackHandler()) return
      if (overlays.length > 0) {
        popOverlay()
      } else if (activeTab !== 'home') {
        selectTab('home')
      } else {
        CapApp.exitApp()
      }
    }

    const listener = CapApp.addListener('backButton', handleBack)
    return () => {
      listener.then((handle) => handle.remove())
    }
  }, [activeTab, selectTab])

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage />
      case 'calendar':
        return <CalendarPage />
      case 'statistics':
        return <StatisticsPage />
      case 'cards':
        return <CardsPage />
      case 'settings':
        return <SettingsPage />
      default:
        return <HomePage />
    }
  }

  return (
    <>
      {/* The app mounts only after the welcome flow, so nothing under it can be reached
        (the FAB is portaled outside the app). The flow fades out over the fresh Home */}
      {!showOnboarding && (
        <div className={appContainer}>
          <div className={appWrapper}>
            {/* The old page slides out one way while the new one slides in from the other.
            `custom` on AnimatePresence: the leaving page uses the new direction too */}
            <main className={mainContent}>
              <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                <motion.div
                  key={activeTab}
                  className={page}
                  custom={direction}
                  variants={pageVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                >
                  {renderActiveScreen()}
                </motion.div>
              </AnimatePresence>
            </main>

            {/* Fixed Mobile Bottom Navigation */}
            <BottomNavBar activeTab={activeTab} onSelectTab={selectTab} />

            {/* Overlay stack: every open screen stays mounted (it keeps its state), each new one
            slides in from the right over the previous, and going back slides it out again */}
            <AnimatePresence>
              {overlays.map((overlay, index) => (
                <motion.div
                  key={`${index}-${overlay.type}`}
                  className={overlayContainer}
                  style={{ zIndex: 50 + index }}
                  // Only the top screen is reachable; the ones under it are hidden from screen readers
                  inert={index < overlays.length - 1}
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', stiffness: 380, damping: 40 }}
                >
                  {overlay.type === 'preset-picker' && <PresetPicker />}
                  {overlay.type === 'subscription-form' && (
                    <SubscriptionFormPage
                      preset={overlay.data?.preset}
                      subscriptionId={overlay.data?.subscriptionId}
                    />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Screen readers: always on the page and only its text changes, so every toast is
            announced (a live region that mounts together with its text is often missed) */}
            <div role="status" className={srOnly}>
              {toast &&
                (toast.action
                  ? `${toast.message}, ${toast.action.label}`
                  : toast.message)}
            </div>

            <AnimatePresence>
              {toast && (
                <Toast
                  key={toast.id}
                  type={toast.type}
                  action={toast.action}
                  message={
                    <Typography variant="body" size="sm">
                      {toast.message}
                    </Typography>
                  }
                  onDismiss={hideToast}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showOnboarding && <OnboardingFlow key="onboarding" />}
      </AnimatePresence>
    </>
  )
}

export default App
