import { parseISODate, toISODate } from '@/shared/lib/isoDate'
import type { BillingCycle } from '@/shared/types'

export const BILLING_CYCLE_LABELS: Record<BillingCycle, string> = {
  'one-time': 'Pago único',
  weekly: 'Semanal',
  monthly: 'Mensual',
  bimonthly: 'Bimestral',
  semiannual: 'Semestral',
  yearly: 'Anual',
}

const CYCLE_STEP: Record<BillingCycle, { months: number; days: number }> = {
  'one-time': { months: 0, days: 0 },
  weekly: { months: 0, days: 7 },
  monthly: { months: 1, days: 0 },
  bimonthly: { months: 2, days: 0 },
  semiannual: { months: 6, days: 0 },
  yearly: { months: 12, days: 0 },
}

export function addCycles(date: string, cycle: BillingCycle, count: number) {
  const parsed = parseISODate(date)
  if (!parsed) return date

  const { months, days } = CYCLE_STEP[cycle]

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

export function nextBillDate(firstBillDate: string, cycle: BillingCycle, today: string) {
  const { months, days } = CYCLE_STEP[cycle]
  if ((months === 0 && days === 0)) return firstBillDate
  let count = 0
  while (addCycles(firstBillDate, cycle, count) < today) count++
  return addCycles(firstBillDate, cycle, count)
}