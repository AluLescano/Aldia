// UTILS
import { daysBetween } from './isoDate'

// TYPES
import type { TrialConfig } from '@/shared/types'

// Up to this many days away, a charge shows as a countdown; further away, as a date
const COUNTDOWN_DAYS = 30

const MONTHS = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
]

/**
 * A `YYYY-MM-DD` date in the short Spanish form used on cards and fields.
 * Returns `''` for an empty or malformed date.
 *
 * @example
 * formatDate('2026-10-16') // '16 Oct 26'
 */
export function formatDate(date: string) {
  const [year, month, day] = date.split('-')
  if (!year || !month || !day) return ''

  return `${day} ${MONTHS[parseInt(month, 10) - 1]} ${year.slice(2)}`
}

/**
 * When the next charge is, the way the cards show it: a countdown while it's close
 * ("Hoy", "Mañana", "En 5 días"), the date once it's more than 30 days away
 * (nobody thinks in "en 287 días"). Pure: pass `todayISO()` as `today`.
 *
 * @example
 * formatNextCharge('2026-10-28', '2026-10-23') // 'En 5 días'
 * formatNextCharge('2027-08-15', '2026-10-23') // '15 Ago 27'
 */
export function formatNextCharge(date: string, today: string) {
  const soon = countdown(date, today)
  return soon ? soon[0].toUpperCase() + soon.slice(1) : formatDate(date)
}

/**
 * A free trial on a card, so "En 7 días" doesn't read like a charge: when it starts if it
 * hasn't yet, otherwise when it ends. Same 30-day rule as `formatNextCharge`.
 *
 * @example
 * formatTrial({ startDate: '2026-10-20', endDate: '2026-10-26' }, '2026-10-23') // 'Prueba termina en 3 días'
 * formatTrial({ startDate: '2026-11-01', endDate: '2026-11-08' }, '2026-10-23') // 'Prueba empieza en 9 días'
 */
export function formatTrial(trial: TrialConfig, today: string) {
  const [verb, date] =
    trial.startDate > today ? ['empieza', trial.startDate] : ['termina', trial.endDate]
  return `¡Prueba ${verb} ${countdown(date, today) ?? `el ${formatDate(date)}`}!`
}

// "hoy", "mañana" or "en N días" up to 30 days away; null further away or in the past
function countdown(date: string, today: string) {
  const days = daysBetween(today, date)
  if (days === 0) return 'hoy'
  if (days === 1) return 'mañana'
  if (days > 1 && days <= COUNTDOWN_DAYS) return `en ${days} días`
  return null
}
