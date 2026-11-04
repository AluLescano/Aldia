import { describe, expect, it } from 'vitest'

import { isInactive, statusFor, type StatusSource } from './subscriptionStatus'

const TODAY = '2026-10-23'
const trial = (endDate: string) => ({ startDate: '2026-10-01', endDate })

// Monthly on the 5th, no trial, no pauses, no end, unless a test says otherwise
const sub = (extra: Partial<StatusSource> = {}): StatusSource => ({
  firstBillDate: '2026-01-05',
  billingCycle: { type: 'every', interval: 1, unit: 'month' },
  pauses: [],
  ...extra,
})

const PAUSED = [{ from: '2026-10-01' }]

describe('statusFor', () => {
  it('is active without a trial', () => {
    expect(statusFor(sub(), TODAY)).toBe('active')
  })

  it('is trial until the trial ends', () => {
    expect(statusFor(sub({ trial: trial('2026-10-24') }), TODAY)).toBe('trial')
  })

  it('turns active on the day the trial ends (the first charge)', () => {
    expect(statusFor(sub({ trial: trial(TODAY) }), TODAY)).toBe('active')
  })

  it('is inactive when paused, trial or not', () => {
    expect(statusFor(sub({ pauses: PAUSED }), TODAY)).toBe('inactive')
    expect(statusFor(sub({ pauses: PAUSED, trial: trial('2026-11-01') }), TODAY)).toBe(
      'inactive',
    )
  })

  it('is active again once the pause ended', () => {
    const resumed = [{ from: '2026-09-01', to: '2026-10-01' }]
    expect(statusFor(sub({ pauses: resumed }), TODAY)).toBe('active')
  })

  it.each([
    ['2026-10-01', 'ended'], // the end date already passed
    ['2026-11-01', 'ended'], // still before the end, but the next charge (Nov 5) is after it
    ['2026-11-05', 'active'], // the end date is the next charge day: it still happens
    ['2027-01-01', 'active'],
  ])('with an end date on %s it is %s', (endDate, status) => {
    expect(statusFor(sub({ endDate }), TODAY)).toBe(status)
  })

  it('ended wins over paused', () => {
    expect(statusFor(sub({ endDate: '2026-10-01', pauses: PAUSED }), TODAY)).toBe('ended')
  })
})

describe('isInactive', () => {
  it.each([
    ['active', sub(), false],
    ['trial', sub({ trial: trial('2026-10-24') }), false],
    ['paused', sub({ pauses: PAUSED }), true],
    ['ended', sub({ endDate: '2026-10-01' }), true],
  ])('%s → %s', (_, source, expected) => {
    expect(isInactive(source, TODAY)).toBe(expected)
  })
})
