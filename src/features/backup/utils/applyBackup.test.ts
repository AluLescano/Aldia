import { beforeEach, describe, expect, it, vi } from 'vitest'

import { applyBackup, currentVersions } from './applyBackup'
import { useSubscriptionStore } from '@/features/subscriptions/store/subscriptionStore'
import { useCategoryStore } from '@/features/categories/store/categoryStore'
import { useSettingsStore } from '@/features/settings/store/settingsStore'
import type { Subscription } from '@/shared/types'
import type { Backup } from '../types'

// The real fileStorage needs the Capacitor plugin. Tests run in plain Node, so the stores
// save into this Map instead (`vi.hoisted` creates it before `vi.mock` runs)
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

const netflix: Subscription = {
  id: 'b1',
  name: 'Netflix',
  priceHistory: [{ from: '2026-10-01', price: 10, currency: 'USD' }],
  schedule: [
    { from: '2026-10-01', billingCycle: { type: 'every', interval: 1, unit: 'month' } },
  ],
  categoryId: 'entertainment',
  reminders: [],
  pauses: [],
  createdAt: '2026-10-01T00:00:00.000Z',
}

// A backup made by this app version: subscriptions on 3, categories and settings on 0
const backup: Backup = {
  app: 'aldia',
  format: 1,
  exportedOn: '2026-11-17',
  appVersion: '0.4.0',
  stores: {
    subscriptions: { state: { subscriptions: [netflix] }, version: 3 },
    categories: {
      state: { categories: [{ id: 'others', name: 'Otros', color: '#8E9FAF' }] },
      version: 0,
    },
    settings: {
      state: {
        selectedCurrency: 'EUR',
        favoriteCurrencies: ['EUR', 'USD'],
        reminderTime: '08:30',
        listSort: 'name-asc',
        hasSeenOnboarding: true,
        hasAskedForNotificationsAgain: true,
      },
      version: 0,
    },
  },
}

beforeEach(() => {
  savedFiles.clear()
})

describe('applyBackup', () => {
  it('writes each store file exactly as persist saves it: { state, version }', async () => {
    await applyBackup(backup)

    for (const name of ['subscriptions', 'categories', 'settings'] as const) {
      const saved = JSON.parse(savedFiles.get(name) ?? 'null')
      expect(saved).toEqual(backup.stores[name])
    }
  })

  it('loads the backup into the stores', async () => {
    await applyBackup(backup)

    expect(useSubscriptionStore.getState().subscriptions).toEqual([netflix])
    expect(useCategoryStore.getState().categories).toEqual([
      { id: 'others', name: 'Otros', color: '#8E9FAF' },
    ])
    expect(useSettingsStore.getState().selectedCurrency).toBe('EUR')
    expect(useSettingsStore.getState().reminderTime).toBe('08:30')
  })

  it('replaces what the app had before', async () => {
    useSubscriptionStore.setState({
      subscriptions: [{ ...netflix, id: 'old', name: 'Old one' }],
    })

    await applyBackup(backup)

    expect(useSubscriptionStore.getState().subscriptions.map((sub) => sub.id)).toEqual([
      'b1',
    ])
  })

  it('upgrades a 0.5.0 backup (subscriptions on version 2) through the migration', async () => {
    const { schedule, ...rest } = netflix
    const netflixV2 = {
      ...rest,
      firstBillDate: schedule[0].from,
      billingCycle: schedule[0].billingCycle,
    }
    const old: Backup = {
      ...backup,
      stores: {
        ...backup.stores,
        subscriptions: { state: { subscriptions: [netflixV2] }, version: 2 },
      },
    }

    await applyBackup(old)

    expect(useSubscriptionStore.getState().subscriptions).toEqual([netflix])
  })
})

describe('currentVersions', () => {
  it('reads each store’s persist version (Zustand’s default 0 when it never set one)', () => {
    expect(currentVersions()).toEqual({ subscriptions: 3, categories: 0, settings: 0 })
  })
})
