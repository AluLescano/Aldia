import { useState } from 'react'
import type { TabType } from '@/shared/types'
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
        return (
          <HomePage
            onNewSubscription={() => alert('New subscription modal will open here!')}
          />
        )
      case 'calendar':
        return <CalendarPage />
      case 'cards':
        return <CardsPage />
      case 'statistics':
        return <StatisticsPage />
      case 'settings':
        return <SettingsPage />
      default:
        return <HomePage />
    }
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex justify-center selection:bg-indigo-500 selection:text-white">
      {/* Mobile-centric frame container (max-w-md creates an app preview feel on desktop while filling mobile screens) */}
      <div className="w-full max-w-md min-h-screen flex flex-col bg-zinc-950 px-4 pt-[max(env(safe-area-inset-top),20px)] relative shadow-2xl border-x border-zinc-900/50">
        {/* Top Header */}
        <header className="flex items-center justify-between pb-4 pt-1">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-indigo-400">
              Aldia
            </span>
            <p className="text-lg font-bold tracking-tight text-white">
              Monthly Overview
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:border-zinc-700 transition-colors"
            >
              <span>USD</span>
              <span className="text-[10px] text-zinc-500">▼</span>
            </button>
          </div>
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
