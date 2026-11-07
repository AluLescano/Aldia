import { describe, expect, it } from 'vitest'

import { chargesByDay } from './chargesByDay'
import type { Subscription } from '@/shared/types'

// Monthly, unless a test says otherwise
const sub = (
  id: string,
  firstBillDate: string,
  extra: Partial<Subscription> = {},
): Subscription => ({
  id,
  name: id,
  priceHistory: [{ from: firstBillDate, price: 10, currency: 'USD' }],
  billingCycle: { type: 'every', interval: 1, unit: 'month' },
  firstBillDate,
  categoryId: 'entertainment',
  reminders: [],
  pauses: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  ...extra,
})

const netflix = sub('netflix', '2026-01-15')
const spotify = sub('spotify', '2026-03-15')
const chatgpt = sub('chatgpt', '2026-02-03')

// November 2026's grid: Nov 1 (a Sunday) to Dec 12
const FROM = '2026-11-01'
const TO = '2026-12-12'

// The map as { date: [subscription ids] }, easy to compare
const ids = (byDay: ReturnType<typeof chargesByDay>) =>
  Object.fromEntries(
    [...byDay].map(([date, charges]) => [date, charges.map((c) => c.subscriptionId)]),
  )

describe('chargesByDay', () => {
  it('groups every subscription’s charges by their date', () => {
    expect(ids(chargesByDay([netflix, spotify, chatgpt], FROM, TO))).toEqual({
      '2026-11-03': ['chatgpt'],
      '2026-11-15': ['netflix', 'spotify'],
      '2026-12-03': ['chatgpt'],
    })
  })

  it('keeps each charge whole, with its date', () => {
    const [charge] = chargesByDay([netflix], FROM, TO).get('2026-11-15') ?? []
    expect(charge).toEqual({
      subscriptionId: 'netflix',
      date: '2026-11-15',
      price: 10,
      currency: 'USD',
      isPaused: false,
      isTrialEnd: false,
    })
  })

  it('leaves days with no charges out of the map', () => {
    const byDay = chargesByDay([netflix], FROM, TO)
    expect(byDay.has('2026-11-14')).toBe(false)
    expect(byDay.size).toBe(1)
  })

  it('puts paused charges last within a day', () => {
    // Paused since Nov 1, and listed first
    const youtube = sub('youtube', '2026-06-15', { pauses: [{ from: '2026-11-01' }] })
    const day =
      chargesByDay([youtube, netflix, spotify], FROM, TO).get('2026-11-15') ?? []
    expect(day.map((c) => [c.subscriptionId, c.isPaused])).toEqual([
      ['netflix', false],
      ['spotify', false],
      ['youtube', true],
    ])
  })

  it('keeps the order of charges that are both paused or both not', () => {
    const pausedA = sub('a', '2026-01-15', { pauses: [{ from: '2026-11-01' }] })
    const pausedB = sub('b', '2026-01-15', { pauses: [{ from: '2026-11-01' }] })
    const day = chargesByDay([pausedA, spotify, pausedB, netflix], FROM, TO).get(
      '2026-11-15',
    )
    expect(day?.map((c) => c.subscriptionId)).toEqual(['spotify', 'netflix', 'a', 'b'])
  })

  it('includes charges on the first and last day of the range', () => {
    const onFirst = sub('first', '2026-10-01')
    const onLast = sub('last', '2026-10-12')
    expect(ids(chargesByDay([onFirst, onLast], FROM, TO))).toEqual({
      '2026-11-01': ['first'],
      '2026-11-12': ['last'],
      '2026-12-01': ['first'],
      '2026-12-12': ['last'],
    })
  })

  it('is empty with no subscriptions, or none charging in the range', () => {
    expect(chargesByDay([], FROM, TO).size).toBe(0)
    const ended = sub('gym', '2026-01-10', { endDate: '2026-10-20' })
    expect(chargesByDay([ended], FROM, TO).size).toBe(0)
  })
})
