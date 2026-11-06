// HOOKS
import { useState } from 'react'

// UTILS
import { parseISODate, todayISO } from '@/shared/lib/isoDate'

// COMPONENTS
import MonthNav from '@/features/calendar/components/MonthNav/MonthNav'

// ASSETS
import styles from './CalendarPage.module.scss'

export const CalendarPage = () => {
  const { container } = styles

  const today = todayISO()
  const start = parseISODate(today)!
  // The month on screen ({ year, month 0-11 }). It lives here because the grid, the day sheet
  // and the total will all read it
  const [view, setView] = useState({ year: start.getFullYear(), month: start.getMonth() })

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
    </div>
  )
}
