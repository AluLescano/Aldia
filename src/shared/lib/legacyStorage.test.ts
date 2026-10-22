import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { clearLegacyStorage } from './legacyStorage'

/* Tests run in plain Node, which has no localStorage: a Map-backed fake stands in for it. */
const saved = new Map<string, string>()
const fakeLocalStorage = {
  getItem: (key: string) => saved.get(key) ?? null,
  setItem: (key: string, value: string) => void saved.set(key, value),
  removeItem: (key: string) => void saved.delete(key),
}

beforeEach(() => {
  saved.clear()
  vi.stubGlobal('localStorage', fakeLocalStorage)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('clearLegacyStorage', () => {
  it('removes the old build’s keys', () => {
    saved.set('aldia_subscriptions_v1', '{}')
    saved.set('aldia_categories_v1', '{}')
    saved.set('aldia_settings', '{}')

    clearLegacyStorage()

    expect(saved.size).toBe(0)
  })

  it('keeps the exchange rates, which still live in localStorage', () => {
    saved.set('aldia_settings', '{}')
    saved.set('aldia_rates', '{"date":"2026-10-22"}')

    clearLegacyStorage()

    expect([...saved.keys()]).toEqual(['aldia_rates'])
  })

  it('does nothing when the keys are already gone', () => {
    expect(() => clearLegacyStorage()).not.toThrow()
    expect(saved.size).toBe(0)
  })
})
