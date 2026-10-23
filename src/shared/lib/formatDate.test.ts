import { describe, expect, it } from 'vitest'

import { formatDate, formatDayMonth, formatNextCharge, formatTrial } from './formatDate'

const TODAY = '2026-10-23'

describe('formatDate', () => {
  it('shows the short Spanish form', () => {
    expect(formatDate('2026-10-16')).toBe('16 Oct 26')
  })

  it('is empty for a broken date', () => {
    expect(formatDate('')).toBe('')
  })
})

describe('formatNextCharge', () => {
  it.each([
    ['2026-10-23', 'Hoy'],
    ['2026-10-24', 'Mañana'],
    ['2026-10-28', 'En 5 días'],
    ['2026-11-22', 'En 30 días'],
  ])('counts down to %s: %s', (date, expected) => {
    expect(formatNextCharge(date, TODAY)).toBe(expected)
  })

  it('shows the date once the charge is more than 30 days away', () => {
    expect(formatNextCharge('2026-11-23', TODAY)).toBe('23 Nov 26')
    expect(formatNextCharge('2027-08-15', TODAY)).toBe('15 Ago 27')
  })

  it('counts across a month and a year change', () => {
    expect(formatNextCharge('2027-01-02', '2026-12-30')).toBe('En 3 días')
  })

  it('shows a past date as a date, never a negative countdown', () => {
    expect(formatNextCharge('2026-10-20', TODAY)).toBe('20 Oct 26')
  })
})

describe('formatTrial', () => {
  const trial = (startDate: string, endDate: string) => ({ startDate, endDate })

  it.each([
    [trial('2026-10-20', '2026-10-26'), 'Tu prueba termina en 3 días'],
    [trial('2026-10-20', '2026-10-24'), 'Tu prueba termina mañana'],
    [trial('2026-10-23', '2026-10-30'), 'Tu prueba termina en 7 días'],
  ])('counts down to the end of a running trial: %o', (value, expected) => {
    expect(formatTrial(value, TODAY)).toBe(expected)
  })

  it('counts down to the start of a trial that has not started', () => {
    expect(formatTrial(trial('2026-11-01', '2026-11-08'), TODAY)).toBe(
      'Tu prueba empieza en 9 días',
    )
  })

  it('shows the date when it is more than 30 days away', () => {
    expect(formatTrial(trial('2026-10-01', '2026-12-30'), TODAY)).toBe(
      'Tu prueba termina el 30 Dic 26',
    )
  })
})

describe('formatDayMonth', () => {
  it('shows only day and month', () => {
    expect(formatDayMonth('2026-11-12')).toBe('12 Nov')
  })

  it('is empty for a broken date', () => {
    expect(formatDayMonth('')).toBe('')
  })
})
