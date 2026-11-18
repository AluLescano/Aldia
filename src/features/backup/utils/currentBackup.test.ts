import { describe, expect, it, vi } from 'vitest'

import { currentBackup } from './currentBackup'
import { useSubscriptionStore } from '@/features/subscriptions/store/subscriptionStore'
import { useSettingsStore } from '@/features/settings/store/settingsStore'
import type { Subscription } from '@/shared/types'

// The real fileStorage needs the Capacitor plugin; these tests never touch the disk
vi.mock('@/shared/lib/fileStorage', () => ({
  fileStorage: {
    getItem: async () => null,
    setItem: async () => {},
    removeItem: async () => {},
  },
}))

const netflix: Subscription = {
  id: 'b1',
  name: 'Netflix',
  priceHistory: [{ from: '2026-10-01', price: 10, currency: 'USD' }],
  billingCycle: { type: 'every', interval: 1, unit: 'month' },
  firstBillDate: '2026-10-01',
  categoryId: 'entertainment',
  reminders: [],
  pauses: [],
  createdAt: '2026-10-01T00:00:00.000Z',
}

describe('currentBackup', () => {
  it('wraps the three stores with the app label, the app version and the day', () => {
    const backup = currentBackup('2026-11-17')

    expect(backup.app).toBe('aldia')
    expect(backup.format).toBe(1)
    expect(backup.exportedOn).toBe('2026-11-17')
    expect(backup.appVersion).toBe(__APP_VERSION__)
    expect(Object.keys(backup.stores)).toEqual([
      'subscriptions',
      'categories',
      'settings',
    ])
  })

  it('saves each store as persist does, with its own version', () => {
    useSubscriptionStore.setState({ subscriptions: [netflix] })
    useSettingsStore.setState({ selectedCurrency: 'EUR' })

    const { stores } = currentBackup('2026-11-17')

    expect(stores.subscriptions).toEqual({
      state: { subscriptions: [netflix] },
      version: 2,
    })
    expect(stores.categories.version).toBe(0)
    expect(stores.settings.state).toMatchObject({ selectedCurrency: 'EUR' })
  })

  it('takes the data as it is when called, so a later change does not leak in', () => {
    useSubscriptionStore.setState({ subscriptions: [netflix] })
    const before = currentBackup('2026-11-17')

    useSubscriptionStore.setState({ subscriptions: [] })

    expect(before.stores.subscriptions.state).toEqual({ subscriptions: [netflix] })
  })
})
