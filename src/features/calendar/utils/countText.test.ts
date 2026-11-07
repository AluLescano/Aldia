import { describe, expect, it } from 'vitest'

import { countText, daySummary } from './countText'

describe('countText', () => {
  it('says "Sin cobros" for none, and singular or plural', () => {
    expect(countText(0)).toBe('Sin cobros')
    expect(countText(1)).toBe('1 cobro')
    expect(countText(4)).toBe('4 cobros')
  })
})

describe('daySummary', () => {
  it('is just the charges when there are no trials', () => {
    expect(daySummary(0, 0)).toBe('Sin cobros')
    expect(daySummary(2, 0)).toBe('2 cobros')
  })

  it('is just the trials when nothing is charged', () => {
    expect(daySummary(0, 1)).toBe('1 prueba gratis')
    expect(daySummary(0, 3)).toBe('3 pruebas gratis')
  })

  it('joins both with a dot', () => {
    expect(daySummary(1, 1)).toBe('1 cobro · 1 prueba gratis')
    expect(daySummary(2, 2)).toBe('2 cobros · 2 pruebas gratis')
  })
})
