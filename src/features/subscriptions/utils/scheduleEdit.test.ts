import { describe, expect, it } from 'vitest'

import { applyScheduleEdit, editAnchor, landsOn, sameCycle } from './scheduleEdit'
import { nextScheduledCharge } from './schedule'
import { pastCharges } from './subscriptionHistory'
import type { BillingCycle, BillingUnit, Schedule } from '@/shared/types'

const every = (interval: number, unit: BillingUnit): BillingCycle => ({
  type: 'every',
  interval,
  unit,
})
const MONTHLY = every(1, 'month')
const YEARLY = every(1, 'year')
const ONE_TIME: BillingCycle = { type: 'one-time' }

// Monthly on the 10th since Oct 10
const CLAUDE: Schedule = [{ from: '2026-10-10', billingCycle: MONTHLY }]

describe('sameCycle', () => {
  it.each([
    [MONTHLY, every(1, 'month'), true],
    [MONTHLY, every(2, 'month'), false],
    [MONTHLY, YEARLY, false],
    [ONE_TIME, { type: 'one-time' } as BillingCycle, true],
    [ONE_TIME, MONTHLY, false],
  ])('%o vs %o is %s', (a, b, expected) => {
    expect(sameCycle(a, b)).toBe(expected)
  })
})

describe('editAnchor', () => {
  it('shows the next charge and its cycle', () => {
    expect(editAnchor({ schedule: CLAUDE }, '2026-11-12')).toEqual({
      kind: 'next',
      date: '2026-12-10',
      billingCycle: MONTHLY,
    })
  })

  it('shows the first charge when there is a trial (its start shapes the first charge)', () => {
    const trial = { startDate: '2026-09-26', endDate: '2026-10-10' }
    expect(editAnchor({ schedule: CLAUDE, trial }, '2026-11-12')).toEqual({
      kind: 'first',
      date: '2026-10-10',
      billingCycle: MONTHLY,
    })
  })

  it('shows the first charge when it ended (there is no next one)', () => {
    expect(
      editAnchor({ schedule: CLAUDE, endDate: '2026-11-10' }, '2026-11-12').kind,
    ).toBe('first')
  })
})

describe('landsOn', () => {
  const to14th = { date: '2026-12-14', billingCycle: MONTHLY }

  it.each([
    ['a past charge lands on the new day of its month', '2026-11-10', '2026-11-14'],
    ['the next charge too', '2026-12-10', '2026-12-14'],
    ['even far back, without drifting', '2026-01-10', '2026-01-14'],
  ])('%s', (_, charge, expected) => {
    expect(landsOn(to14th, charge)).toBe(expected)
  })

  it('moved earlier, a charge lands a few days before', () => {
    expect(landsOn({ date: '2026-12-07', billingCycle: MONTHLY }, '2026-11-10')).toBe(
      '2026-11-07',
    )
  })

  it('a new cycle lands on its own charge closest to the old one', () => {
    expect(landsOn({ date: '2026-12-10', billingCycle: YEARLY }, '2026-11-10')).toBe(
      '2026-12-10', // Dec 10 2026 is 30 days away, Dec 10 2025 almost a year
    )
    expect(landsOn({ date: '2026-12-10', billingCycle: YEARLY }, '2026-12-10')).toBe(
      '2026-12-10',
    )
  })

  it('a one-time payment is the picked date', () => {
    expect(landsOn({ date: '2026-12-01', billingCycle: ONE_TIME }, '2026-11-10')).toBe(
      '2026-12-01',
    )
  })
})

describe('applyScheduleEdit', () => {
  it('from a past charge: it moves, so it is gone (the Claude Pro case, Alu Nov 20)', () => {
    // The Nov 10 charge really came on Nov 14; the form said the next one is Dec 14
    const moved = applyScheduleEdit(
      CLAUDE,
      { date: '2026-12-14', billingCycle: MONTHLY },
      '2026-11-10',
    )
    expect(moved).toEqual([
      { from: '2026-10-10', billingCycle: MONTHLY },
      { from: '2026-11-14', billingCycle: MONTHLY, since: '2026-11-10' },
    ])
    expect(pastCharges({ schedule: moved }, '2026-11-20')).toEqual([
      '2026-11-14',
      '2026-10-10',
    ])
    expect(nextScheduledCharge(moved, '2026-11-20')).toBe('2026-12-14')
  })

  it('from the next charge: the past stays, even if both charges happened', () => {
    // Nov 12: the next charge (Dec 10) moves to Dec 14; Oct 10 and Nov 10 stay
    const moved = applyScheduleEdit(
      CLAUDE,
      { date: '2026-12-14', billingCycle: MONTHLY },
      '2026-12-10',
    )
    expect(pastCharges({ schedule: moved }, '2026-12-20')).toEqual([
      '2026-12-14',
      '2026-11-10',
      '2026-10-10',
    ])
  })

  it('a day moved later before the old charge came: that charge never happens', () => {
    // Nov 5: the next charge (Nov 10) moves to Nov 14
    const moved = applyScheduleEdit(
      CLAUDE,
      { date: '2026-11-14', billingCycle: MONTHLY },
      '2026-11-10',
    )
    expect(nextScheduledCharge(moved, '2026-11-05')).toBe('2026-11-14')
    expect(pastCharges({ schedule: moved }, '2026-12-20')).toEqual([
      '2026-12-14',
      '2026-11-14',
      '2026-10-10',
    ])
  })

  it('a day moved earlier takes over where it lands', () => {
    const moved = applyScheduleEdit(
      CLAUDE,
      { date: '2026-12-07', billingCycle: MONTHLY },
      '2026-11-10',
    )
    expect(moved[1]).toEqual({ from: '2026-11-07', billingCycle: MONTHLY })
    expect(pastCharges({ schedule: moved }, '2026-12-20')).toEqual([
      '2026-12-07',
      '2026-11-07',
      '2026-10-10',
    ])
  })

  it('a new cycle from a past charge keeps the ones before monthly', () => {
    const yearly = applyScheduleEdit(
      CLAUDE,
      { date: '2026-12-10', billingCycle: YEARLY },
      '2026-11-10',
    )
    expect(pastCharges({ schedule: yearly }, '2028-01-01')).toEqual([
      '2027-12-10',
      '2026-12-10',
      '2026-10-10',
    ])
  })

  it('from the first charge: one rhythm for the whole history (a correction)', () => {
    expect(
      applyScheduleEdit(
        CLAUDE,
        { date: '2026-12-14', billingCycle: MONTHLY },
        '2026-10-10',
      ),
    ).toEqual([{ from: '2026-10-14', billingCycle: MONTHLY }])
  })

  it('replaces changes saved for later', () => {
    const twice: Schedule = [
      ...CLAUDE,
      { from: '2026-12-14', billingCycle: MONTHLY, since: '2026-12-10' },
    ]
    expect(
      applyScheduleEdit(
        twice,
        { date: '2026-12-20', billingCycle: MONTHLY },
        '2026-11-10',
      ),
    ).toEqual([
      { from: '2026-10-10', billingCycle: MONTHLY },
      { from: '2026-11-20', billingCycle: MONTHLY, since: '2026-11-10' },
    ])
  })

  it('keeps an earlier change that happened before the picked charge', () => {
    const moved: Schedule = [
      ...CLAUDE,
      { from: '2026-11-14', billingCycle: MONTHLY, since: '2026-11-10' },
    ]
    expect(
      applyScheduleEdit(
        moved,
        { date: '2026-12-14', billingCycle: YEARLY },
        '2026-12-14',
      ),
    ).toEqual([...moved, { from: '2026-12-14', billingCycle: YEARLY }])
  })
})
