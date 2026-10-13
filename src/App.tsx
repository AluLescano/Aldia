// DEPENDENCIES
import { useState } from 'react'

// COMPONENTS
import { BottomNavBar } from '@/features/navigation/components/BottomNavBar'
import Toast from './shared/ui/Toast/Toast'
import Typography from './shared/ui/Typography/Typography'

// TYPES
import type { TabType } from '@/shared/types'

// HOOKS
import { useUIStore } from './shared/store/uiStore'
import { useToastStore } from './features/subscriptions/store/toastStore'

// ANIMATIONS
import { AnimatePresence } from 'motion/react'

// PAGES
import { HomePage } from '@/pages/home/HomePage'
import { CalendarPage } from '@/pages/calendar/CalendarPage'
import { CardsPage } from '@/pages/cards/CardsPage'
import { StatisticsPage } from '@/pages/statistics/StatisticsPage'
import { SettingsPage } from '@/pages/settings/SettingsPage'
import { PresetPicker } from './pages/presetPicker/PresetPicker'
import { SubscriptionFormPage } from './pages/subscriptionForm/SubscriptionFormPage'

// ASSETS
import styles from './App.module.scss'


function App() {
  const { appContainer, appWrapper, mainContent, overlayContainer } = styles
  const [activeTab, setActiveTab] = useState<TabType>('home')
  const overlays = useUIStore((state) => state.overlays)
  const activeOverlay = overlays[overlays.length - 1]

  const toast = useToastStore((state) => state.toast)
  const hideToast = useToastStore((state) => state.hideToast)

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

        {/* Overlay Renderer */}
        {activeOverlay && (
          <div className={overlayContainer}>
            {activeOverlay.type === 'preset-picker' && <PresetPicker />}
            {activeOverlay.type === 'subscription-form' && (
              <SubscriptionFormPage preset={activeOverlay.data?.preset} />
            )}
          </div>
        )}

        <AnimatePresence>
          {toast && (
            <Toast
              key={toast.id}
              position="top"
              type={toast.type}
              message={
                <Typography variant="body" size="medium">
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
