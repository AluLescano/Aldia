import { describe, expect, it } from 'vitest'

import { addDays, daysBetween, parseISODate, toISODate } from './isoDate'
import { getMonthGrid } from './calendar'

describe('parseISODate / toISODate', () => {
  it('round-trips a date in local time', () => {
    const date = parseISODate('2026-01-05')
    expect(date).not.toBeNull()
    expect(toISODate(date!)).toBe('2026-01-05')
  })

  it('returns null for a half date', () => {
    expect(parseISODate('2026-10')).toBeNull()
    expect(parseISODate('')).toBeNull()
  })
})

describe('addDays', () => {
  it.each([
    ['2026-10-30', 7, '2026-11-06'],
    ['2026-12-30', 3, '2027-01-02'],
    ['2026-03-01', -1, '2026-02-28'],
    ['2028-02-28', 1, '2028-02-29'],
  ])('%s + %d days = %s', (date, days, expected) => {
    expect(addDays(date, days)).toBe(expected)
  })

  it('returns a broken date unchanged', () => {
    expect(addDays('nope', 3)).toBe('nope')
  })
})

describe('daysBetween', () => {
  it('counts whole days, both ways', () => {
    expect(daysBetween('2026-10-16', '2026-10-23')).toBe(7)
    expect(daysBetween('2026-10-23', '2026-10-16')).toBe(-7)
  })

  it('is 0 when a date is broken', () => {
    expect(daysBetween('2026-10', '2026-10-23')).toBe(0)
  })
})

describe('getMonthGrid', () => {
  it.each([
    [2026, 9, '2026-09-27', '2026-11-07'], // October 2026 starts on Thursday
    [2026, 10, '2026-11-01', '2026-12-12'], // November 2026 starts on Sunday
    [2027, 1, '2027-01-31', '2027-03-13'],
    [2028, 1, '2028-01-30', '2028-03-11'], // leap February
  ])('%d-%d starts %s and ends %s', (year, month, first, last) => {
    const grid = getMonthGrid(year, month)
    expect(grid).toHaveLength(42)
    expect(grid[0]).toBe(first)
    expect(grid[41]).toBe(last)
  })
})
