// DEPENDENCIES
import { useState } from 'react'

// UTILS
import { parseISODate } from '@/shared/lib/isoDate'

/** The month on screen: `month` is 0-11, like `Date.getMonth()`. */
export interface ShownMonth {
  year: number
  month: number
}

/**
 * The month the Calendario shows, and how to move it. `direction` says which way the last
 * move went (1 forward, -1 back, 0 at first), so the grid slides in from the right side.
 *
 * @param today `YYYY-MM-DD`: the month it starts on, and where "Hoy" goes back to.
 * @example
 * const { view, goToMonth, goToToday, isCurrentMonth } = useCalendarMonth(todayISO())
 * goToMonth(1) // December, from November
 */
export function useCalendarMonth(today: string) {
  const start = parseISODate(today) ?? new Date()
  const current: ShownMonth = { year: start.getFullYear(), month: start.getMonth() }

  const [view, setView] = useState<ShownMonth>(current)
  const [direction, setDirection] = useState(0)

  const goToMonth = (delta: number) => {
    // new Date(2026, 12, 1) is January 2027, so December + 1 wraps the year by itself
    const next = new Date(view.year, view.month + delta, 1)
    setDirection(Math.sign(delta))
    setView({ year: next.getFullYear(), month: next.getMonth() })
  }

  const goToToday = () => {
    const isBefore =
      view.year < current.year ||
      (view.year === current.year && view.month < current.month)
    setDirection(isBefore ? 1 : -1)
    setView(current)
  }

  const isCurrentMonth = view.year === current.year && view.month === current.month

  return { view, direction, goToMonth, goToToday, isCurrentMonth }
}
