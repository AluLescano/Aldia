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
  // Back to a fresh install: rehydrating fills missing fields from the current state
  useSettingsStore.setState(useSettingsStore.getInitialState())
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

describe('onboarding flags', () => {
  it('start as not seen and not asked again', () => {
    const state = useSettingsStore.getState()
    expect(state.hasSeenOnboarding).toBe(false)
    expect(state.hasAskedForNotificationsAgain).toBe(false)
  })

  it('save each one on its own', () => {
    useSettingsStore.getState().finishOnboarding()
    let saved = JSON.parse(savedFiles.get('settings') ?? 'null')
    expect(saved.state.hasSeenOnboarding).toBe(true)
    expect(saved.state.hasAskedForNotificationsAgain).toBe(false)

    useSettingsStore.getState().markNotificationsAskedAgain()
    saved = JSON.parse(savedFiles.get('settings') ?? 'null')
    expect(saved.state.hasAskedForNotificationsAgain).toBe(true)
  })

  it('are false for a file saved before they existed, so updaters see the flow once', async () => {
    savedFiles.set(
      'settings',
      JSON.stringify({
        state: { selectedCurrency: 'ARS', reminderTime: '20:00' },
        version: 0,
      }),
    )
    await useSettingsStore.persist.rehydrate()

    const state = useSettingsStore.getState()
    expect(state.reminderTime).toBe('20:00')
    expect(state.hasSeenOnboarding).toBe(false)
    expect(state.hasAskedForNotificationsAgain).toBe(false)
  })
})
