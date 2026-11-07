import { describe, expect, it } from 'vitest'

import {
  applyPriceEdit,
  chargesBetween,
  endPause,
  isPausedOn,
  nextCharge,
  pastCharges,
  priceOn,
  startPause,
  upcomingPrice,
} from './subscriptionHistory'
import type { BillingCycle, Pause, PriceHistory } from '@/shared/types'

const MONTHLY: BillingCycle = { type: 'every', interval: 1, unit: 'month' }

describe('priceOn', () => {
  const history: PriceHistory = [
    { from: '2026-01-10', price: 9.99, currency: 'USD' },
    { from: '2026-06-10', price: 12.99, currency: 'USD' },
    { from: '2026-09-10', price: 15000, currency: 'ARS' }, // moved to pesos
  ]

  it.each([
    ['2026-01-10', 9.99], // the first day of the first price
    ['2026-03-10', 9.99],
    ['2026-06-09', 9.99], // the day before a change still has the old price
    ['2026-06-10', 12.99], // a change applies from its own day
    ['2026-08-31', 12.99],
    ['2026-12-10', 15000],
  ])('on %s the price is %d', (date, price) => {
    expect(priceOn(history, date).price).toBe(price)
  })

  it('keeps the currency of each change', () => {
    expect(priceOn(history, '2026-10-10').currency).toBe('ARS')
  })

  it('before the first change, uses the first price', () => {
    expect(priceOn(history, '2025-12-31').price).toBe(9.99)
  })

  it('works with a single price', () => {
    expect(
      priceOn([{ from: '2026-01-10', price: 5, currency: 'USD' }], '2027-01-01').price,
    ).toBe(5)
  })
})

describe('isPausedOn', () => {
  const pauses: Pause[] = [
    { from: '2026-03-08', to: '2026-03-12' }, // paused 4 days in March
    { from: '2026-10-01' }, // paused since Oct 1, not resumed
  ]

  it.each([
    ['2026-03-07', false], // the day before
    ['2026-03-08', true], // the day it was paused
    ['2026-03-11', true],
    ['2026-03-12', false], // the day it was resumed: charges happen again
    ['2026-09-30', false],
    ['2026-10-01', true], // still paused, with no end
    ['2027-05-20', true],
  ])('on %s paused is %s', (date, expected) => {
    expect(isPausedOn(pauses, date)).toBe(expected)
  })

  it('is never paused without pauses', () => {
    expect(isPausedOn([], '2026-03-10')).toBe(false)
  })
})

// Alu's phone plan: charged on the 5th, the price keeps going up
describe('applyPriceEdit', () => {
  const claro: PriceHistory = [
    { from: '2026-09-05', price: 11300, currency: 'ARS' },
    { from: '2026-10-05', price: 11500, currency: 'ARS' },
  ]

  it('adds a new price from the next charge, keeping the old ones', () => {
    expect(
      applyPriceEdit(
        claro,
        { from: '2026-11-05', price: 11768, currency: 'ARS' },
        '2026-09-05',
      ),
    ).toEqual([...claro, { from: '2026-11-05', price: 11768, currency: 'ARS' }])
  })

  it('changes nothing when the price is the one already in force', () => {
    const same = applyPriceEdit(
      claro,
      { from: '2026-11-05', price: 11500, currency: 'ARS' },
      '2026-09-05',
    )
    expect(same).toBe(claro) // the same array: nothing to save
  })

  it('a new currency is a change, even with the same number', () => {
    expect(
      applyPriceEdit(
        claro,
        { from: '2026-11-05', price: 11500, currency: 'USD' },
        '2026-09-05',
      ),
    ).toHaveLength(3)
  })

  it('replaces a change planned on or after the new one', () => {
    const planned: PriceHistory = [
      ...claro,
      { from: '2026-12-05', price: 12000, currency: 'ARS' },
    ]
    expect(
      applyPriceEdit(
        planned,
        { from: '2026-11-05', price: 11768, currency: 'ARS' },
        '2026-09-05',
      ),
    ).toEqual([...claro, { from: '2026-11-05', price: 11768, currency: 'ARS' }])
  })

  it('before the first charge happened, the new price is the only one', () => {
    const fresh: PriceHistory = [{ from: '2026-11-20', price: 10, currency: 'USD' }]
    expect(
      applyPriceEdit(
        fresh,
        { from: '2026-11-20', price: 12, currency: 'USD' },
        '2026-11-20',
      ),
    ).toEqual([{ from: '2026-11-20', price: 12, currency: 'USD' }])
  })

  it('keeps the first price starting on the first charge, even if that date was edited', () => {
    const moved = applyPriceEdit(
      claro,
      { from: '2026-11-05', price: 11768, currency: 'ARS' },
      '2026-08-05', // the user moved the first charge a month earlier
    )
    expect(moved[0]).toEqual({ from: '2026-08-05', price: 11300, currency: 'ARS' })
  })
})

describe('upcomingPrice', () => {
  const claro = {
    firstBillDate: '2026-09-05',
    billingCycle: MONTHLY,
    priceHistory: [
      { from: '2026-09-05', price: 11500, currency: 'ARS' },
      { from: '2026-11-05', price: 11768, currency: 'ARS' },
    ] as PriceHistory,
  }

  it('is the price of the next charge, even before that day comes', () => {
    expect(upcomingPrice(claro, '2026-11-03').price).toBe(11768) // next charge Nov 5
  })

  it('on a charge day, is that charge', () => {
    expect(upcomingPrice(claro, '2026-10-05').price).toBe(11500)
  })
})

describe('startPause / endPause', () => {
  const schedule = { firstBillDate: '2026-01-10', billingCycle: MONTHLY } // the 10th

  it('pausing opens a pause from today', () => {
    expect(startPause([], '2026-03-08')).toEqual([{ from: '2026-03-08' }])
  })

  it('resuming after a skipped charge keeps the pause, ending today', () => {
    // Paused Mar 8, the Mar 10 charge is skipped, resumed Mar 12
    expect(endPause([{ from: '2026-03-08' }], '2026-03-12', schedule)).toEqual([
      { from: '2026-03-08', to: '2026-03-12' },
    ])
  })

  it('resuming before any charge was skipped drops the pause', () => {
    // Paused Mar 11, resumed Mar 20: the next charge (Apr 10) hasn't come
    expect(endPause([{ from: '2026-03-11' }], '2026-03-20', schedule)).toEqual([])
  })

  it('resuming the same day drops the pause', () => {
    expect(endPause([{ from: '2026-03-08' }], '2026-03-08', schedule)).toEqual([])
  })

  it('resuming on a charge day: that charge happens, so nothing was skipped', () => {
    // Paused Mar 11, resumed Apr 10 (a charge day): Apr 10 is charged
    expect(endPause([{ from: '2026-03-11' }], '2026-04-10', schedule)).toEqual([])
  })

  it('keeps the older, closed pauses as they were', () => {
    const old: Pause = { from: '2026-01-08', to: '2026-01-12' }
    expect(endPause([old, { from: '2026-03-08' }], '2026-03-12', schedule)).toEqual([
      old,
      { from: '2026-03-08', to: '2026-03-12' },
    ])
  })
})

describe('nextCharge', () => {
  const claro = { firstBillDate: '2026-09-05', billingCycle: MONTHLY } // the 5th

  it('is the next charge on or after today', () => {
    expect(nextCharge(claro, '2026-11-03')).toBe('2026-11-05')
    expect(nextCharge(claro, '2026-11-05')).toBe('2026-11-05')
  })

  it.each([
    ['2026-11-20', '2026-11-03', '2026-11-05'], // the end is after the next charge
    ['2026-11-05', '2026-11-03', '2026-11-05'], // the end date is a charge day: it happens
    ['2026-11-20', '2026-11-06', null], // Dec 5 is after the end: none left
    ['2026-10-31', '2026-11-03', null], // already ended
  ])('ending %s, on %s the next charge is %s', (endDate, today, expected) => {
    expect(nextCharge({ ...claro, endDate }, today)).toBe(expected)
  })
})

describe('pastCharges', () => {
  const claro = { firstBillDate: '2026-09-05', billingCycle: MONTHLY }

  it('lists the charges before today, newest first', () => {
    expect(pastCharges(claro, '2026-11-03')).toEqual(['2026-10-05', '2026-09-05'])
  })

  it("doesn't count today's charge: it's the next one", () => {
    expect(pastCharges(claro, '2026-10-05')).toEqual(['2026-09-05'])
  })

  it('is empty before the first charge', () => {
    expect(pastCharges(claro, '2026-09-01')).toEqual([])
  })

  it('keeps only the newest ones', () => {
    expect(pastCharges(claro, '2027-11-03', 3)).toEqual([
      '2027-10-05',
      '2027-09-05',
      '2027-08-05',
    ])
  })
})

describe('chargesBetween', () => {
  // Monthly on the 15th since Aug 15, 9.99 until it went up to 12.99 on Nov 15
  const netflix = {
    id: 'netflix',
    firstBillDate: '2026-08-15',
    billingCycle: MONTHLY,
    priceHistory: [
      { from: '2026-08-15', price: 9.99, currency: 'USD' },
      { from: '2026-11-15', price: 12.99, currency: 'USD' },
    ] satisfies PriceHistory,
    pauses: [] as Pause[],
  }
  const dates = (charges: { date: string }[]) => charges.map((charge) => charge.date)

  it('finds the charges of a month grid (Nov 1 to Dec 12)', () => {
    expect(chargesBetween(netflix, '2026-11-01', '2026-12-12')).toEqual([
      {
        subscriptionId: 'netflix',
        date: '2026-11-15',
        price: 12.99,
        currency: 'USD',
        isPaused: false,
        isTrialEnd: false,
      },
    ])
  })

  it('gives each charge the price in force on its day, oldest first', () => {
    const charges = chargesBetween(netflix, '2026-10-01', '2027-01-31')
    expect(charges.map(({ date, price }) => [date, price])).toEqual([
      ['2026-10-15', 9.99],
      ['2026-11-15', 12.99], // the change starts on this charge
      ['2026-12-15', 12.99],
      ['2027-01-15', 12.99],
    ])
  })

  it('keeps the currency of each price', () => {
    const toPesos = {
      ...netflix,
      priceHistory: [
        { from: '2026-08-15', price: 9.99, currency: 'USD' },
        { from: '2026-11-15', price: 11300, currency: 'ARS' },
      ] satisfies PriceHistory,
    }
    const charges = chargesBetween(toPesos, '2026-10-01', '2026-11-30')
    expect(charges.map(({ currency }) => currency)).toEqual(['USD', 'ARS'])
  })

  it('includes charges on both ends of the range', () => {
    expect(dates(chargesBetween(netflix, '2026-11-15', '2026-12-15'))).toEqual([
      '2026-11-15',
      '2026-12-15',
    ])
    expect(dates(chargesBetween(netflix, '2026-11-15', '2026-11-15'))).toEqual([
      '2026-11-15',
    ])
  })

  it('is empty when no charge falls in the range', () => {
    expect(chargesBetween(netflix, '2026-11-16', '2026-12-14')).toEqual([])
    // Before the first charge
    expect(chargesBetween(netflix, '2026-07-01', '2026-08-14')).toEqual([])
  })

  it('keeps paused charges, flagged, and only the ones inside the pause', () => {
    // Paused Dec 1, resumed Jan 3: only Dec 15 is skipped
    const paused = { ...netflix, pauses: [{ from: '2026-12-01', to: '2027-01-03' }] }
    const charges = chargesBetween(paused, '2026-11-01', '2027-01-31')
    expect(charges.map(({ date, isPaused }) => [date, isPaused])).toEqual([
      ['2026-11-15', false],
      ['2026-12-15', true],
      ['2027-01-15', false],
    ])
  })

  it('flags every charge after a pause that is still open', () => {
    const stillPaused = { ...netflix, pauses: [{ from: '2026-12-01' }] }
    const charges = chargesBetween(stillPaused, '2026-11-01', '2027-01-31')
    expect(charges.map(({ isPaused }) => isPaused)).toEqual([false, true, true])
  })

  it('stops at the end date, keeping a charge on that very day', () => {
    const ending = { ...netflix, endDate: '2026-12-15' }
    expect(dates(chargesBetween(ending, '2026-10-01', '2027-01-31'))).toEqual([
      '2026-10-15',
      '2026-11-15',
      '2026-12-15',
    ])
  })

  it('is empty when the subscription ended before the range', () => {
    const ended = { ...netflix, endDate: '2026-10-20' }
    expect(chargesBetween(ended, '2026-11-01', '2026-12-12')).toEqual([])
  })

  it('flags only the charge that ends the free trial', () => {
    // A 14-day trial: the first charge is the day it ends
    const withTrial = {
      ...netflix,
      firstBillDate: '2026-11-15',
      priceHistory: [
        { from: '2026-11-15', price: 12.99, currency: 'USD' },
      ] satisfies PriceHistory,
      trial: { startDate: '2026-11-01', endDate: '2026-11-15' },
    }
    const charges = chargesBetween(withTrial, '2026-11-01', '2027-01-31')
    expect(charges.map(({ date, isTrialEnd }) => [date, isTrialEnd])).toEqual([
      ['2026-11-15', true],
      ['2026-12-15', false],
      ['2027-01-15', false],
    ])
  })

  it('gives nothing for a one-time payment, even inside the range (and ends)', () => {
    const oneTime = {
      ...netflix,
      firstBillDate: '2026-11-20',
      billingCycle: { type: 'one-time' } satisfies BillingCycle,
    }
    expect(chargesBetween(oneTime, '2026-11-01', '2026-12-12')).toEqual([])
  })

  it('lands on the last day of short months without drifting', () => {
    const endOfMonth = {
      ...netflix,
      firstBillDate: '2026-01-31',
      priceHistory: [
        { from: '2026-01-31', price: 5, currency: 'USD' },
      ] satisfies PriceHistory,
    }
    expect(dates(chargesBetween(endOfMonth, '2026-02-01', '2026-05-31'))).toEqual([
      '2026-02-28',
      '2026-03-31',
      '2026-04-30',
      '2026-05-31',
    ])
  })

  it('finds every charge of a weekly subscription', () => {
    const weekly = {
      ...netflix,
      firstBillDate: '2026-11-02', // a Monday
      billingCycle: { type: 'every', interval: 1, unit: 'week' } satisfies BillingCycle,
    }
    expect(dates(chargesBetween(weekly, '2026-11-01', '2026-12-12'))).toEqual([
      '2026-11-02',
      '2026-11-09',
      '2026-11-16',
      '2026-11-23',
      '2026-11-30',
      '2026-12-07',
    ])
  })

  // The tightest cycle: moving on from any day later than the next one would skip charges
  it('finds every charge of a daily subscription', () => {
    const daily = {
      ...netflix,
      firstBillDate: '2026-11-01',
      billingCycle: { type: 'every', interval: 1, unit: 'day' } satisfies BillingCycle,
    }
    expect(dates(chargesBetween(daily, '2026-11-03', '2026-11-06'))).toEqual([
      '2026-11-03',
      '2026-11-04',
      '2026-11-05',
      '2026-11-06',
    ])
  })
})
