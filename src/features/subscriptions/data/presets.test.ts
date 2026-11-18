import { describe, expect, it } from 'vitest'

import { PRESET_SUBSCRIPTIONS } from './presets'

// The 12 default category ids in categoryStore (not exported, so listed here)
const DEFAULT_CATEGORY_IDS = [
  'ai',
  'business',
  'entertainment',
  'gaming',
  'learning',
  'lifestyle',
  'productivity',
  'shopping',
  'storage',
  'technology',
  'bills',
  'others',
]

describe('PRESET_SUBSCRIPTIONS', () => {
  it('is in A-Z order by name, the way the picker shows it', () => {
    const names = PRESET_SUBSCRIPTIONS.map((preset) => preset.name)
    const sorted = [...names].sort((a, b) =>
      a.localeCompare(b, 'es', { sensitivity: 'base' }),
    )

    expect(names).toEqual(sorted)
  })

  it('only points at default categories', () => {
    for (const preset of PRESET_SUBSCRIPTIONS) {
      expect(DEFAULT_CATEGORY_IDS).toContain(preset.defaultCategoryId)
    }
  })

  it('has no repeated ids', () => {
    const ids = PRESET_SUBSCRIPTIONS.map((preset) => preset.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
