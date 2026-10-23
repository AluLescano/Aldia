import { describe, expect, it } from 'vitest'

import { statusFor } from './subscriptionStatus'

const TODAY = '2026-10-23'
const trial = (endDate: string) => ({ startDate: '2026-10-01', endDate })

describe('statusFor', () => {
  it('is active without a trial', () => {
    expect(statusFor({ isPaused: false }, TODAY)).toBe('active')
  })

  it('is trial until the trial ends', () => {
    expect(statusFor({ isPaused: false, trial: trial('2026-10-24') }, TODAY)).toBe(
      'trial',
    )
  })

  it('turns active on the day the trial ends (the first charge)', () => {
    expect(statusFor({ isPaused: false, trial: trial(TODAY) }, TODAY)).toBe('active')
  })

  it('is inactive when paused, trial or not', () => {
    expect(statusFor({ isPaused: true }, TODAY)).toBe('inactive')
    expect(statusFor({ isPaused: true, trial: trial('2026-11-01') }, TODAY)).toBe(
      'inactive',
    )
  })
})
