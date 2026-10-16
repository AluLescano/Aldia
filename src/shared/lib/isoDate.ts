// Dates travel through the app as 'YYYY-MM-DD' strings in LOCAL time.
// Never use toISOString(): it works in UTC and can move a date to the day before.

/**
 * Turns a `YYYY-MM-DD` string into a local-time `Date` (midnight).
 * Returns `null` when a part is missing. It does not check the date exists:
 * `'2026-02-31'` becomes March 3rd, so compare with `toISODate` to validate.
 */
export function parseISODate(date: string) {
  const [year, month, day] = date.split('-')
  if (!year || !month || !day) return null
  return new Date(Number(year), Number(month) - 1, Number(day))
}

/** Turns a `Date` into its local `YYYY-MM-DD` string. */
export function toISODate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Today as `YYYY-MM-DD`, in local time. */
export function todayISO() {
  return toISODate(new Date())
}

/**
 * Moves a `YYYY-MM-DD` date by a number of days (negative goes back).
 * Month and year changes are handled by `Date`. Returns the input unchanged if it can't be parsed.
 *
 * @example
 * addDays('2026-10-30', 7) // '2026-11-06'
 */
export function addDays(date: string, days: number) {
  const parsed = parseISODate(date)
  if (!parsed) return date
  parsed.setDate(parsed.getDate() + days)
  return toISODate(parsed)
}

/**
 * Whole days from one `YYYY-MM-DD` date to another (negative if `to` is earlier).
 * Returns 0 if either date can't be parsed.
 *
 * @example
 * daysBetween('2026-10-16', '2026-10-23') // 7
 */
export function daysBetween(from: string, to: string) {
  const start = parseISODate(from)
  const end = parseISODate(to)
  if (!start || !end) return 0
  // Math.round absorbs the 1 hour shift of daylight saving
  return Math.round((end.getTime() - start.getTime()) / 86_400_000)
}
