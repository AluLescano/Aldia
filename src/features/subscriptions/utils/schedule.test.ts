import { describe, expect, it } from 'vitest'

import { cycleOn, nextScheduledCharge, upcomingCycle } from './schedule'
import type { BillingCycle, BillingUnit, Schedule } from '@/shared/types'

const every = (interval: number, unit: BillingUnit): BillingCycle => ({
  type: 'every',
  interval,
  unit,
})
const MONTHLY = every(1, 'month')
const YEARLY = every(1, 'year')
const ONE_TIME: BillingCycle = { type: 'one-time' }

// Monthly on the 10th, then yearly from Jun 10
const MONTHLY_THEN_YEARLY: Schedule = [
  { from: '2026-01-10', billingCycle: MONTHLY },
  { from: '2026-06-10', billingCycle: YEARLY },
]

describe('nextScheduledCharge', () => {
  it('works like nextBillDate with a single entry', () => {
    const schedule: Schedule = [{ from: '2026-01-10', billingCycle: MONTHLY }]
    expect(nextScheduledCharge(schedule, '2026-03-11')).toBe('2026-04-10')
  })

  it('counts on the new day after a switch in the past (the Claude Pro case)', () => {
    // Charged Oct 10, then the charge day moved to Nov 14
    const schedule: Schedule = [
      { from: '2026-10-10', billingCycle: MONTHLY },
      { from: '2026-11-14', billingCycle: MONTHLY },
    ]
    expect(nextScheduledCharge(schedule, '2026-11-18')).toBe('2026-12-14')
  })

  it('keeps the old rhythm until a switch that is still ahead', () => {
    expect(nextScheduledCharge(MONTHLY_THEN_YEARLY, '2026-03-01')).toBe('2026-03-10')
  })

  it('hands over to the next entry when the old charge would land on or after it', () => {
    // The old rhythm's next charge would be Jun 10 itself: the new entry owns it
    expect(nextScheduledCharge(MONTHLY_THEN_YEARLY, '2026-05-11')).toBe('2026-06-10')
    expect(nextScheduledCharge(MONTHLY_THEN_YEARLY, '2026-07-01')).toBe('2027-06-10')
  })

  it('counts a charge on today', () => {
    expect(nextScheduledCharge(MONTHLY_THEN_YEARLY, '2026-06-10')).toBe('2026-06-10')
  })

  it('returns the first entry when it has not started yet', () => {
    expect(nextScheduledCharge(MONTHLY_THEN_YEARLY, '2025-12-01')).toBe('2026-01-10')
  })

  it('skips a one-time charge that already happened', () => {
    const schedule: Schedule = [
      { from: '2026-01-05', billingCycle: ONE_TIME },
      { from: '2026-03-01', billingCycle: MONTHLY },
    ]
    expect(nextScheduledCharge(schedule, '2026-04-10')).toBe('2026-05-01')
  })

  it('still returns a lone one-time charge in the past, so statusFor can call it ended', () => {
    const schedule: Schedule = [{ from: '2026-01-05', billingCycle: ONE_TIME }]
    expect(nextScheduledCharge(schedule, '2026-04-10')).toBe('2026-01-05')
  })
})

describe('cycleOn', () => {
  it.each([
    ['before the first entry: the first cycle', '2025-12-01', MONTHLY],
    ['the day before a switch: the old cycle', '2026-06-09', MONTHLY],
    ['on the switch day: the new cycle', '2026-06-10', YEARLY],
    ['after the switch: the new cycle', '2027-01-01', YEARLY],
  ])('%s', (_, date, expected) => {
    expect(cycleOn(MONTHLY_THEN_YEARLY, date).billingCycle).toEqual(expected)
  })
})

describe('upcomingCycle', () => {
  it('is the cycle of the next charge', () => {
    expect(upcomingCycle(MONTHLY_THEN_YEARLY, '2026-03-01')).toEqual(MONTHLY)
  })

  it('shows the new cycle as soon as the next charge is the switch', () => {
    // May 11: the next charge is Jun 10, the first yearly one
    expect(upcomingCycle(MONTHLY_THEN_YEARLY, '2026-05-11')).toEqual(YEARLY)
  })
})

describe('since (the day a rhythm took over)', () => {
  // Monthly on the 10th, then on Nov 5 the next charge moved to Nov 14
  const MOVED_EARLY: Schedule = [
    { from: '2026-10-10', billingCycle: MONTHLY },
    { from: '2026-11-14', billingCycle: MONTHLY, since: '2026-11-05' },
  ]

  it('the old rhythm stops on that day, even before the new first charge', () => {
    // Without `since`, Nov 10 would still belong to the old rhythm
    expect(nextScheduledCharge(MOVED_EARLY, '2026-11-06')).toBe('2026-11-14')
  })

  it('charges before it keep the old rhythm', () => {
    expect(nextScheduledCharge(MOVED_EARLY, '2026-10-01')).toBe('2026-10-10')
  })

  it('cycleOn switches on that day', () => {
    expect(cycleOn(MOVED_EARLY, '2026-11-04').from).toBe('2026-10-10')
    expect(cycleOn(MOVED_EARLY, '2026-11-05').from).toBe('2026-11-14')
  })
})
