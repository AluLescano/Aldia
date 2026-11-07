// UTILS
import { toISODate } from './isoDate'

/**
 * The 42 days (6 weeks of 7) a month calendar shows, as `YYYY-MM-DD`, starting on
 * Sunday. It includes the end of the previous month and the start of the next one,
 * so every month has the same height.
 *
 * @param month 0-based, like `Date` (0 = January).
 * @example
 * getMonthGrid(2026, 9)[0]  // '2026-09-27' (October 2026 starts on a Thursday)
 */
export function getMonthGrid(year: number, month: number) {
  const days: string[] = []
  const offset = new Date(year, month, 1).getDay() // 0 = Sunday
  for (let i = 0; i < 42; i++) {
    // Day 0 or negative days roll back into the previous month, Date handles it
    days.push(toISODate(new Date(year, month, 1 - offset + i)))
  }
  return days
}

// "octubre" -> "Octubre", built once when the file loads
export const MONTHS = Array.from({ length: 12 }, (_, month) => {
  const name = new Date(2000, month, 1).toLocaleDateString('es-AR', { month: 'long' })
  return name.charAt(0).toUpperCase() + name.slice(1)
})

export const WEEKDAYS = ['D', 'L', 'M', 'X', 'J', 'V', 'S']
