// UTILS
import { parseISODate, toISODate } from '@/shared/lib/isoDate'

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

/**
 * The next charge on or after `today`. A first charge in the future is returned as is;
 * a one-time payment always returns its date. Pure: pass `todayISO()` as `today`.
 *
 * @example
 * nextBillDate('2026-01-31', { type: 'every', interval: 1, unit: 'month' }, '2026-03-01') // '2026-03-31'
 */
export function nextBillDate(firstBillDate: string, cycle: BillingCycle, today: string) {
  const { months, days } = cycleStep(cycle)
  // Anything that does not move forward (one-time, 0, negative, NaN) has no next date.
  // Asking "is it > 0" catches NaN too, because NaN is neither bigger nor equal to anything.
  if (!(months > 0) && !(days > 0)) return firstBillDate
  let count = 0
  while (addCycles(firstBillDate, cycle, count) < today) count++
  return addCycles(firstBillDate, cycle, count)
}
