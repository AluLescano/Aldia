import { describe, expect, it } from 'vitest'

import { statusFor } from './subscriptionStatus'

const TODAY = '2026-10-23'
const trial = (endDate: string) => ({ startDate: '2026-10-01', endDate })

describe('statusFor', () => {
  it('is active without a trial', () => {
    expect(statusFor({ pauses: [] }, TODAY)).toBe('active')
  })

  it('is trial until the trial ends', () => {
    expect(statusFor({ pauses: [], trial: trial('2026-10-24') }, TODAY)).toBe('trial')
  })

  it('turns active on the day the trial ends (the first charge)', () => {
    expect(statusFor({ pauses: [], trial: trial(TODAY) }, TODAY)).toBe('active')
  })

  it('is inactive when paused, trial or not', () => {
    expect(statusFor({ pauses: [{ from: '2026-10-01' }] }, TODAY)).toBe('inactive')
    expect(
      statusFor({ pauses: [{ from: '2026-10-01' }], trial: trial('2026-11-01') }, TODAY),
    ).toBe('inactive')
  })
})
