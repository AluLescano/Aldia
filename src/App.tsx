import { useState } from 'react'
import type { TabType } from '@/shared/types'
import Typography from '@/shared/ui/Typography/Typography'
import { BottomNavBar } from '@/features/navigation/components/BottomNavBar'
import { HomePage } from '@/pages/home/HomePage'
import { CalendarPage } from '@/pages/calendar/CalendarPage'
import { CardsPage } from '@/pages/cards/CardsPage'
import { StatisticsPage } from '@/pages/statistics/StatisticsPage'
import { SettingsPage } from '@/pages/settings/SettingsPage'

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home')

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
    <div className="min-h-screen flex justify-center">
      {/* Mobile-centric frame container (max-w-md creates an app preview feel on desktop while filling mobile screens) */}
      <div className="w-full max-w-md min-h-screen flex flex-col px-4 pt-[max(env(safe-area-inset-top),20px)] relative shadow-2xl border-x border-zinc-900/50">
        {/* Top Header */}
        <header className="flex items-center justify-center pb-4 pt-1">
          <Typography variant="overline" size="small" className="tracking-[0.25em]">
            Aldia
          </Typography>
        </header>

        {/* Main Screen Content */}
        <main className="flex-1 overflow-y-auto pt-2">{renderActiveScreen()}</main>

        {/* Fixed Mobile Bottom Navigation */}
        <BottomNavBar activeTab={activeTab} onSelectTab={setActiveTab} />
      </div>
    </div>
  )
}

export default App
