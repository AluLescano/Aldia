import { describe, expect, it } from 'vitest'

import {
  getReminderTriggers,
  groupTriggersByDay,
  type ReminderTrigger,
} from './reminders'
import type { Subscription, SubscriptionReminder } from '@/shared/types'

// Planning window used everywhere: from Oct 22 to Dec 21 (about 60 days)
const TODAY = '2026-10-22'
const UNTIL = '2026-12-21'

const reminder = (daysBefore: number, isEnabled = true): SubscriptionReminder => ({
  id: `r${daysBefore}`,
  daysBefore,
  isEnabled,
})

// Monthly on the 15th with one reminder 3 days before, unless a test says otherwise
const sub = (extra: Partial<Subscription> = {}): Subscription => ({
  id: 'netflix',
  name: 'Netflix',
  price: 10,
  currency: 'USD',
  billingCycle: { type: 'every', interval: 1, unit: 'month' },
  firstBillDate: '2026-01-15',
  categoryId: 'entertainment',
  reminders: [reminder(3)],
  isPaused: false,
  createdAt: '2026-01-15T00:00:00.000Z',
  ...extra,
})

// The parts that change between tests: "notify day > charge day : target"
const summary = (triggers: ReminderTrigger[]) =>
  triggers.map(({ date, eventDate, target }) => `${date} > ${eventDate} : ${target}`)

describe('getReminderTriggers', () => {
  it('notifies before every charge inside the window', () => {
    expect(summary(getReminderTriggers(sub(), TODAY, UNTIL))).toEqual([
      '2026-11-12 > 2026-11-15 : billing',
      '2026-12-12 > 2026-12-15 : billing',
    ])
  })

  it('fills in which subscription and reminder each one is for', () => {
    expect(getReminderTriggers(sub(), TODAY, UNTIL)[0]).toMatchObject({
      subscriptionId: 'netflix',
      reminderId: 'r3',
    })
  })

  it('skips a notify day that already passed, but keeps the next charges', () => {
    // Charge on Oct 24: 3 days before is Oct 21, yesterday
    expect(
      summary(getReminderTriggers(sub({ firstBillDate: '2026-10-24' }), TODAY, UNTIL)),
    ).toEqual(['2026-11-21 > 2026-11-24 : billing', '2026-12-21 > 2026-12-24 : billing'])
  })

  it('includes a notify day on the last day of the window', () => {
    const triggers = getReminderTriggers(
      sub({ firstBillDate: '2026-10-24' }),
      TODAY,
      UNTIL,
    )
    expect(triggers.at(-1)?.date).toBe(UNTIL)
  })

  it('can notify on the charge day itself (0 days before)', () => {
    const triggers = getReminderTriggers(sub({ reminders: [reminder(0)] }), TODAY, UNTIL)
    expect(triggers[0]).toMatchObject({ date: '2026-11-15', eventDate: '2026-11-15' })
  })

  it('stops at the end date', () => {
    expect(
      summary(getReminderTriggers(sub({ endDate: '2026-11-20' }), TODAY, UNTIL)),
    ).toEqual(['2026-11-12 > 2026-11-15 : billing'])
  })

  it('lands on the last day of short months without drifting', () => {
    const jan31 = sub({ firstBillDate: '2026-01-31', reminders: [reminder(0)] })
    expect(summary(getReminderTriggers(jan31, TODAY, UNTIL))).toEqual([
      '2026-10-31 > 2026-10-31 : billing',
      '2026-11-30 > 2026-11-30 : billing',
    ])
  })

  it('labels only the charge that ends the trial as trial_end', () => {
    // The form makes the trial end the first charge
    const crunchyroll = sub({
      firstBillDate: '2026-11-19',
      trial: { startDate: '2026-10-20', endDate: '2026-11-19' },
      reminders: [reminder(2)],
    })
    expect(summary(getReminderTriggers(crunchyroll, TODAY, UNTIL))).toEqual([
      '2026-11-17 > 2026-11-19 : trial_end',
      '2026-12-17 > 2026-12-19 : billing',
    ])
  })

  it('gives one series per reminder', () => {
    const two = sub({ reminders: [reminder(3), reminder(1)] })
    expect(summary(getReminderTriggers(two, TODAY, UNTIL))).toEqual([
      '2026-11-12 > 2026-11-15 : billing',
      '2026-12-12 > 2026-12-15 : billing',
      '2026-11-14 > 2026-11-15 : billing',
      '2026-12-14 > 2026-12-15 : billing',
    ])
  })

  it.each([
    ['a paused subscription', sub({ isPaused: true })],
    [
      'a one-time payment',
      sub({ billingCycle: { type: 'one-time' }, firstBillDate: '2026-11-01' }),
    ],
    ['a disabled reminder', sub({ reminders: [reminder(3, false)] })],
    ['no reminders at all', sub({ reminders: [] })],
    ['a subscription that ended before the window', sub({ endDate: '2026-10-01' })],
  ])('gives nothing for %s', (_, subscription) => {
    expect(getReminderTriggers(subscription, TODAY, UNTIL)).toEqual([])
  })
})

describe('groupTriggersByDay', () => {
  const trigger = (subscriptionId: string, date: string): ReminderTrigger => ({
    subscriptionId,
    reminderId: 'r1',
    target: 'billing',
    date,
    eventDate: date,
  })

  it('bundles triggers of the same day and sorts the days', () => {
    const netflix = trigger('netflix', '2026-11-17')
    const spotify = trigger('spotify', '2026-11-12')
    const disney = trigger('disney', '2026-11-17')

    expect(groupTriggersByDay([netflix, spotify, disney])).toEqual([
      { date: '2026-11-12', triggers: [spotify] },
      { date: '2026-11-17', triggers: [netflix, disney] },
    ])
  })

  it('sorts across months and years', () => {
    const days = groupTriggersByDay([
      trigger('a', '2027-01-03'),
      trigger('b', '2026-12-30'),
      trigger('c', '2026-11-02'),
    ])
    expect(days.map((day) => day.date)).toEqual([
      '2026-11-02',
      '2026-12-30',
      '2027-01-03',
    ])
  })

  it('leaves the list it gets untouched', () => {
    const input = [trigger('a', '2026-11-17'), trigger('b', '2026-11-12')]
    const copy = [...input]
    groupTriggersByDay(input)
    expect(input).toEqual(copy)
  })

  it('gives an empty list for no triggers', () => {
    expect(groupTriggersByDay([])).toEqual([])
  })

  it('groups what getReminderTriggers gives for several subscriptions', () => {
    const netflix = sub()
    const spotify = sub({ id: 'spotify', firstBillDate: '2026-02-15' }) // also the 15th
    const triggers = [netflix, spotify].flatMap((s) =>
      getReminderTriggers(s, TODAY, UNTIL),
    )

    expect(
      groupTriggersByDay(triggers).map((day) => [
        day.date,
        day.triggers.map((t) => t.subscriptionId),
      ]),
    ).toEqual([
      ['2026-11-12', ['netflix', 'spotify']],
      ['2026-12-12', ['netflix', 'spotify']],
    ])
  })
})
