import { describe, expect, it } from 'vitest'

import { trialsByDay } from './trialsByDay'
import type { Subscription } from '@/shared/types'

const sub = (id: string, trial?: Subscription['trial']): Subscription => ({
  id,
  name: id,
  priceHistory: [{ from: '2026-01-01', price: 10, currency: 'USD' }],
  billingCycle: { type: 'every', interval: 1, unit: 'month' },
  firstBillDate: trial?.endDate ?? '2026-01-01',
  categoryId: 'entertainment',
  reminders: [],
  pauses: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  ...(trial ? { trial } : {}),
})

// November 2026's grid: Nov 1 to Dec 12
const FROM = '2026-11-01'
const TO = '2026-12-12'

// The map as { date: [subscription ids] }, easy to compare
const ids = (map: Map<string, Subscription[]>) =>
  Object.fromEntries([...map].map(([date, subs]) => [date, subs.map((s) => s.id)]))

describe('trialsByDay', () => {
  it('marks every day of a trial, start and end included', () => {
    const disney = sub('disney', { startDate: '2026-11-08', endDate: '2026-11-11' })
    expect(ids(trialsByDay([disney], FROM, TO))).toEqual({
      '2026-11-08': ['disney'],
      '2026-11-09': ['disney'],
      '2026-11-10': ['disney'],
      '2026-11-11': ['disney'],
    })
  })

  it('lists overlapping trials together, in the subscriptions’ order', () => {
    const disney = sub('disney', { startDate: '2026-11-08', endDate: '2026-11-10' })
    const crunchy = sub('crunchy', { startDate: '2026-11-10', endDate: '2026-11-11' })
    expect(ids(trialsByDay([disney, crunchy], FROM, TO))).toEqual({
      '2026-11-08': ['disney'],
      '2026-11-09': ['disney'],
      '2026-11-10': ['disney', 'crunchy'],
      '2026-11-11': ['crunchy'],
    })
  })

  it('keeps only the part inside the range, across month ends too', () => {
    const early = sub('early', { startDate: '2026-10-29', endDate: '2026-11-02' })
    const late = sub('late', { startDate: '2026-12-11', endDate: '2026-12-20' })
    expect(ids(trialsByDay([early, late], FROM, TO))).toEqual({
      '2026-11-01': ['early'],
      '2026-11-02': ['early'],
      '2026-12-11': ['late'],
      '2026-12-12': ['late'],
    })
  })

  it('leaves out subscriptions without a trial or with one outside the range', () => {
    const none = sub('none')
    const before = sub('before', { startDate: '2026-09-01', endDate: '2026-09-08' })
    const after = sub('after', { startDate: '2027-01-01', endDate: '2027-01-08' })
    expect(trialsByDay([none, before, after], FROM, TO).size).toBe(0)
  })

  it('marks a one-day trial once', () => {
    const oneDay = sub('oneDay', { startDate: '2026-11-20', endDate: '2026-11-20' })
    expect(ids(trialsByDay([oneDay], FROM, TO))).toEqual({ '2026-11-20': ['oneDay'] })
  })
})
