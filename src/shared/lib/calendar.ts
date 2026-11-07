// UTILS
import { parseISODate, toISODate } from './isoDate'

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

// What a screen reader says for a day: "martes, 13 de octubre de 2026"
export const fullDate = (iso: string) =>
  parseISODate(iso)?.toLocaleDateString('es-AR', { dateStyle: 'full' })

/**
 * A day without its year, as a title: "Domingo 15 de noviembre". For days of the month on
 * screen, where the year goes without saying. `''` for a malformed date.
 */
export const dayAndMonth = (iso: string) => {
  const text = parseISODate(iso)?.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }) // "domingo, 15 de noviembre"
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1).replace(',', '')
}
