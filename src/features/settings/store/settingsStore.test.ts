import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useSettingsStore } from './settingsStore'

// Tests run in plain Node, without the Capacitor plugin: the store saves into this Map
const savedFiles = vi.hoisted(() => new Map<string, string>())

vi.mock('@/shared/lib/fileStorage', () => ({
  fileStorage: {
    getItem: async (name: string) => savedFiles.get(name) ?? null,
    setItem: async (name: string, value: string) => {
      savedFiles.set(name, value)
    },
    removeItem: async (name: string) => {
      savedFiles.delete(name)
    },
  },
}))

beforeEach(() => {
  savedFiles.clear()
})

describe('reminderTime', () => {
  it('is 09:00 by default', () => {
    expect(useSettingsStore.getState().reminderTime).toBe('09:00')
  })

  it('keeps the default when the saved file is older than the setting', async () => {
    savedFiles.set(
      'settings',
      JSON.stringify({
        state: { selectedCurrency: 'ARS', favoriteCurrencies: ['ARS'] },
        version: 0,
      }),
    )
    await useSettingsStore.persist.rehydrate()

    const state = useSettingsStore.getState()
    expect(state.selectedCurrency).toBe('ARS')
    expect(state.reminderTime).toBe('09:00')
  })

  it('saves a new time', () => {
    useSettingsStore.getState().setReminderTime('20:30')
    const saved = JSON.parse(savedFiles.get('settings') ?? 'null')
    expect(saved.state.reminderTime).toBe('20:30')
  })
})
