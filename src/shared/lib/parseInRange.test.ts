import { describe, expect, it } from 'vitest'

import { parseInRange } from './parseInRange'

describe('parseInRange', () => {
  it.each([
    ['7', 1, undefined, 7],
    ['0', 0, 30, 0],
    ['30', 0, 30, 30],
  ])('reads "%s" (min %d, max %s) as %d', (text, min, max, expected) => {
    expect(parseInRange(text, min, max)).toBe(expected)
  })

  it.each([
    ['empty', '', 0, 30],
    ['below the minimum', '0', 1, undefined],
    ['above the maximum', '31', 0, 30],
    ['with decimals', '1.5', 0, 30],
    ['not a number', 'abc', 0, 30],
  ])('is null when %s', (_, text, min, max) => {
    expect(parseInRange(text, min, max)).toBeNull()
  })
})
