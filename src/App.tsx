// DEPENDENCIES
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

// STORES
import { useUIStore } from '@/shared/store/uiStore'
import { useToastStore } from '@/shared/store/toastStore'
import { useRatesStore } from '@/shared/store/ratesStore'

// COMPONENTS
import BottomNavBar from '@/features/navigation/components/BottomNavBar'
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

/**
 * The app shell: the active tab with the bottom nav, the top overlay of the
 * `uiStore` stack (preset picker, subscription screen), and the app-wide toast.
 * Also keeps the exchange rates fresh.
 */
function App() {
  const { appContainer, appWrapper, mainContent, overlayContainer } = styles
  const [activeTab, setActiveTab] = useState<TabType>('home')
  const overlays = useUIStore((state) => state.overlays)

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
    <div className={appContainer}>
      <div className={appWrapper}>
        <main className={mainContent}>{renderActiveScreen()}</main>

        {/* Fixed Mobile Bottom Navigation */}
        <BottomNavBar activeTab={activeTab} onSelectTab={setActiveTab} />

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
  )
}

export default App
