import { describe, expect, it } from 'vitest'

import { addCycles, formatBillingCycle, nextBillDate } from './billingCycle'
import type { BillingCycle, BillingUnit } from '@/shared/types'

const every = (interval: number, unit: BillingUnit): BillingCycle => ({
  type: 'every',
  interval,
  unit,
})
const ONE_TIME: BillingCycle = { type: 'one-time' }

describe('addCycles', () => {
  it.each([
    [
      'clamps to the last day of a shorter month',
      '2026-01-31',
      every(1, 'month'),
      1,
      '2026-02-28',
    ],
    ['uses Feb 29 in a leap year', '2028-01-31', every(1, 'month'), 1, '2028-02-29'],
    [
      'counts from the anchor, so it does not drift',
      '2026-01-31',
      every(1, 'month'),
      2,
      '2026-03-31',
    ],
    ['clamps a yearly Feb 29', '2028-02-29', every(1, 'year'), 1, '2029-02-28'],
    ['crosses the year by weeks', '2026-12-28', every(1, 'week'), 1, '2027-01-04'],
    ['crosses the month by days', '2026-02-28', every(1, 'day'), 1, '2026-03-01'],
    [
      'handles "every 2 months" over new year',
      '2026-11-15',
      every(2, 'month'),
      1,
      '2027-01-15',
    ],
    ['never moves a one-time payment', '2026-10-16', ONE_TIME, 3, '2026-10-16'],
    [
      'returns the same date for 0 cycles',
      '2026-10-16',
      every(1, 'month'),
      0,
      '2026-10-16',
    ],
  ])('%s', (_, date, cycle, count, expected) => {
    expect(addCycles(date, cycle, count)).toBe(expected)
  })
})

describe('nextBillDate', () => {
  it('finds the next charge after a clamped month', () => {
    expect(nextBillDate('2026-01-31', every(1, 'month'), '2026-03-01')).toBe('2026-03-31')
  })

  it('counts today as a charge day', () => {
    expect(nextBillDate('2026-01-15', every(1, 'month'), '2026-03-15')).toBe('2026-03-15')
  })

  it('returns a future first charge as is', () => {
    expect(nextBillDate('2026-12-01', every(1, 'month'), '2026-10-16')).toBe('2026-12-01')
  })

  it('returns the date of a one-time payment', () => {
    expect(nextBillDate('2026-01-01', ONE_TIME, '2026-10-16')).toBe('2026-01-01')
  })

  it('steps by weeks', () => {
    expect(nextBillDate('2026-10-01', every(1, 'week'), '2026-10-16')).toBe('2026-10-22')
  })

  it('does not loop forever on a broken interval', () => {
    expect(nextBillDate('2026-01-01', every(Number.NaN, 'month'), '2026-10-16')).toBe(
      '2026-01-01',
    )
  })
})

describe('formatBillingCycle', () => {
  it.each([
    [ONE_TIME, 'Pago único'],
    [every(1, 'month'), 'Mensual'],
    [every(1, 'week'), 'Semanal'],
    [every(1, 'year'), 'Anual'],
    [every(2, 'month'), 'Cada 2 meses'],
    [every(1, 'day'), 'Cada 1 día'],
    [every(15, 'day'), 'Cada 15 días'],
  ])('%o → %s', (cycle, expected) => {
    expect(formatBillingCycle(cycle)).toBe(expected)
  })
})
