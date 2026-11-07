// UTILS
import { daysBetween, parseISODate, toISODate } from '@/shared/lib/isoDate'

// TYPES
import type { BillingCycle } from '@/shared/types'

/**
 * The cycle in words, for the form and the cards.
 *
 * @example
 * formatBillingCycle({ type: 'every', interval: 1, unit: 'month' }) // 'Mensual'
 * formatBillingCycle({ type: 'every', interval: 2, unit: 'week' })  // 'Cada 2 semanas'
 */
export function formatBillingCycle(cycle: BillingCycle): string {
  if (cycle.type === 'one-time') return 'Pago único'
  if (cycle.unit === 'month' && cycle.interval === 1) return 'Mensual'
  if (cycle.unit === 'week' && cycle.interval === 1) return 'Semanal'
  if (cycle.unit === 'year' && cycle.interval === 1) return 'Anual'

  const units = {
    day: cycle.interval === 1 ? 'día' : 'días',
    week: cycle.interval === 1 ? 'semana' : 'semanas',
    month: cycle.interval === 1 ? 'mes' : 'meses',
    year: cycle.interval === 1 ? 'año' : 'años',
  }
  return `Cada ${cycle.interval} ${units[cycle.unit]}`
}

/**
 * The cycle as the end of a sentence, after a price: "$ 8.500 al año".
 *
 * @example
 * formatCyclePhrase({ type: 'every', interval: 1, unit: 'year' })  // 'al año'
 * formatCyclePhrase({ type: 'every', interval: 3, unit: 'month' }) // 'cada 3 meses'
 */
export function formatCyclePhrase(cycle: BillingCycle): string {
  if (cycle.type === 'one-time') return 'una vez'

  if (cycle.interval === 1) {
    const everyOne = {
      day: 'al día',
      week: 'a la semana',
      month: 'al mes',
      year: 'al año',
    }
    return everyOne[cycle.unit]
  }

  // Past the `interval === 1` case it's always 2 or more, so always plural
  const units = { day: 'días', week: 'semanas', month: 'meses', year: 'años' }
  return `cada ${cycle.interval} ${units[cycle.unit]}`
}

// One cycle as whole months or as days (a year is 12 months, a week 7 days)
function cycleStep(cycle: BillingCycle) {
  if (cycle.type === 'one-time') return { months: 0, days: 0 }
  if (cycle.unit === 'day') return { months: 0, days: cycle.interval }
  if (cycle.unit === 'week') return { months: 0, days: 7 * cycle.interval }
  if (cycle.unit === 'month') return { months: cycle.interval, days: 0 }
  return { months: 12 * cycle.interval, days: 0 }
}

/**
 * The date `count` cycles after `date`. Months keep the day when they can and clamp
 * to the month's last day when they can't (Jan 31 + 1 month = Feb 28, or 29 in a leap year).
 * Always counts from the original date, so a clamp never "drifts" into later months.
 *
 * @example
 * addCycles('2026-01-31', { type: 'every', interval: 1, unit: 'month' }, 1) // '2026-02-28'
 * addCycles('2026-01-31', { type: 'every', interval: 1, unit: 'month' }, 2) // '2026-03-31'
 */
export function addCycles(date: string, cycle: BillingCycle, count: number) {
  const parsed = parseISODate(date)
  if (!parsed) return date

  const { months, days } = cycleStep(cycle)

  // Weekly: plain days, JavaScript carries over the month
  const result = new Date(parsed)
  result.setDate(result.getDate() + days * count)

  if (months > 0) {
    const total = parsed.getMonth() + months * count
    const year = parsed.getFullYear() + Math.floor(total / 12)
    const month = total % 12
    const lastDay = new Date(year, month + 1, 0).getDate() // day 0 of next month = last day of this one
    return toISODate(new Date(year, month, Math.min(parsed.getDate(), lastDay)))
  }

  return toISODate(result)
}

// How many whole cycles fit from `firstBillDate` to `today`, never more: the charge that
// many cycles in falls on or before `today`, so the next charge is at most one cycle later.
// Months are counted by calendar month (a clamped Jan 31 -> Feb 28 still lands in February)
function cyclesBefore(
  firstBillDate: string,
  today: string,
  months: number,
  days: number,
) {
  if (days > 0) return Math.max(0, Math.floor(daysBetween(firstBillDate, today) / days))
  const start = parseISODate(firstBillDate)
  const end = parseISODate(today)
  if (!start || !end) return 0
  const monthGap =
    (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth()
  return Math.max(0, Math.floor(monthGap / months))
}

/**
 * The next charge on or after `today`. A first charge in the future is returned as is;
 * a one-time payment always returns its date. Pure: pass `todayISO()` as `today`.
 *
 * Jumps straight to the right cycle instead of counting them one by one, so a daily
 * subscription from years ago costs the same as a new one. Still counts from
 * `firstBillDate`, so a Jan 31 subscription never drifts.
 *
 * @example
 * nextBillDate('2026-01-31', { type: 'every', interval: 1, unit: 'month' }, '2026-03-01') // '2026-03-31'
 */
export function nextBillDate(firstBillDate: string, cycle: BillingCycle, today: string) {
  const { months, days } = cycleStep(cycle)
  // Anything that does not move forward (one-time, 0, negative, NaN) has no next date.
  // Asking "is it > 0" catches NaN too, because NaN is neither bigger nor equal to anything.
  if (!(months > 0) && !(days > 0)) return firstBillDate
  // Start from the last charge on or before today; at most one more cycle reaches it
  let count = cyclesBefore(firstBillDate, today, months, days)
  while (addCycles(firstBillDate, cycle, count) < today) count++
  return addCycles(firstBillDate, cycle, count)
}
