// HOOKS
import { useMemo, useState } from 'react'
import { useSubscriptionStore } from '@/features/subscriptions/store/subscriptionStore'
import { useUIStore } from '@/shared/store/uiStore'

// UTILS
import { parseISODate, todayISO } from '@/shared/lib/isoDate'
import { getMonthGrid } from '@/shared/lib/calendar'
import { chargesByDay } from '@/features/calendar/utils/chargesByDay'

// COMPONENTS
import MonthNav from '@/features/calendar/components/MonthNav/MonthNav'
import MonthGrid from '@/features/calendar/components/MonthGrid/MonthGrid'
import DaySheet from '@/features/calendar/components/DaySheet/DaySheet'

// ASSETS
import styles from './CalendarPage.module.scss'

export const CalendarPage = () => {
  const { container } = styles

  const pushOverlay = useUIStore((state) => state.pushOverlay)

  const today = todayISO()
  const start = parseISODate(today)!
  // The month on screen ({ year, month 0-11 }). It lives here because the grid, the day sheet
  // and the total will all read it
  const [view, setView] = useState({ year: start.getFullYear(), month: start.getMonth() })
  const subscriptions = useSubscriptionStore((state) => state.subscriptions)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // Rebuilt only when the month or the subscriptions change, not on every render
  const days = useMemo(() => getMonthGrid(view.year, view.month), [view.year, view.month])
  const byDay = useMemo(
    () => chargesByDay(subscriptions, days[0], days[days.length - 1]),
    [subscriptions, days],
  )
  // A charge only carries its subscription's id: this finds the sub for its logo
  const subsById = useMemo(
    () => new Map(subscriptions.map((sub) => [sub.id, sub])),
    [subscriptions],
  )

  const goToMonth = (delta: number) => {
    const next = new Date(view.year, view.month + delta, 1)
    setView({ year: next.getFullYear(), month: next.getMonth() })
  }

  const goToToday = () => {
    setView({ year: start.getFullYear(), month: start.getMonth() })
  }

  const isCurrentMonth =
    view.year === start.getFullYear() && view.month === start.getMonth()

  return (
    <div className={container}>
      <MonthNav
        year={view.year}
        month={view.month}
        showToday={!isCurrentMonth}
        onPrevious={() => goToMonth(-1)}
        onNext={() => goToMonth(+1)}
        onToday={goToToday}
      />
      <MonthGrid
        days={days}
        month={view.month}
        today={today}
        byDay={byDay}
        subsById={subsById}
        onSelectDay={setSelectedDate}
      />
      <DaySheet
        isOpen={selectedDate !== null}
        date={selectedDate}
        charges={selectedDate ? (byDay.get(selectedDate) ?? []) : []}
        onClose={() => setSelectedDate(null)}
        subsById={subsById}
        onOpenSub={(id) => {
          setSelectedDate(null)
          pushOverlay('subscription-form', { subscriptionId: id })
        }}
      />
    </div>
  )
}
