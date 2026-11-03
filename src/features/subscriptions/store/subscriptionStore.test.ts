import { beforeEach, describe, expect, it, vi } from 'vitest'

import { migrateSubscriptions, useSubscriptionStore } from './subscriptionStore'
import { useToastStore } from '@/shared/store/toastStore'
import { todayISO } from '@/shared/lib/isoDate'
import type { Subscription } from '@/shared/types'

// The real fileStorage needs the Capacitor plugin, which only works in a browser or on the
// phone. Tests run in plain Node, so the store saves into this Map instead (`vi.hoisted`
// creates it before `vi.mock` runs, which Vitest moves to the top of the file)
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

const subscription = (id: string, name: string): Subscription => ({
  id,
  name,
  priceHistory: [{ from: '2026-10-01', price: 10, currency: 'USD' }],
  billingCycle: { type: 'every', interval: 1, unit: 'month' },
  firstBillDate: '2026-10-01',
  categoryId: 'entertainment',
  reminders: [],
  pauses: [],
  createdAt: '2026-10-01T00:00:00.000Z',
})

const netflix = subscription('1', 'Netflix')
const spotify = subscription('2', 'Spotify')

const ids = () => useSubscriptionStore.getState().subscriptions.map((sub) => sub.id)

// Same wiring as useDeleteSubscription: delete, then a toast whose undo restores that one
const deleteWithUndo = (sub: Subscription) => {
  useSubscriptionStore.getState().deleteSubscription(sub.id)
  useToastStore.getState().showToast(`Se eliminó ${sub.name}`, 'success', {
    action: {
      label: 'Deshacer',
      onClick: () => useSubscriptionStore.getState().restoreSubscription(sub),
    },
  })
}

beforeEach(() => {
  savedFiles.clear()
  useSubscriptionStore.setState({ subscriptions: [netflix, spotify] })
  useToastStore.setState({ toast: null })
})

describe('saving', () => {
  it('saves the list through fileStorage after every change', () => {
    useSubscriptionStore.getState().deleteSubscription('1')
    const saved = JSON.parse(savedFiles.get('subscriptions') ?? 'null')
    expect(saved).toEqual({ state: { subscriptions: [spotify] }, version: 2 })
  })
})

describe('migrateSubscriptions', () => {
  const TODAY = '2026-11-03'

  // Netflix the way version 1 saved it: one price, a paused flag, a logo path
  const netflixV1 = (extra: Record<string, unknown> = {}) => {
    const old: Record<string, unknown> = {
      ...netflix,
      price: 10,
      currency: 'USD',
      isPaused: false,
      iconUrl: '/logos/logo_netflix.webp',
      ...extra,
    }
    delete old.priceHistory
    delete old.pauses
    delete old.icon
    return old
  }

  // The same, the way version 0 saved it: a stored status and nextBillDate
  const netflixV0 = (status: string) => {
    const old = netflixV1({ status, nextBillDate: '2026-11-01' })
    delete old.isPaused
    return old
  }

  const netflixV2 = {
    ...netflix,
    icon: { kind: 'preset', path: '/logos/logo_netflix.webp' },
  }

  describe('1 -> 2', () => {
    it('turns the price into the first entry of the history, from the first charge', () => {
      const { subscriptions } = migrateSubscriptions(
        { subscriptions: [netflixV1({ price: 11300, currency: 'ARS' })] },
        1,
        TODAY,
      )
      expect(subscriptions[0].priceHistory).toEqual([
        { from: '2026-10-01', price: 11300, currency: 'ARS' },
      ])
    })

    it('a paused subscription gets an open pause starting on the upgrade day', () => {
      const { subscriptions } = migrateSubscriptions(
        { subscriptions: [netflixV1({ isPaused: true })] },
        1,
        TODAY,
      )
      expect(subscriptions[0].pauses).toEqual([{ from: TODAY }])
    })

    it('a running one gets no pauses', () => {
      const { subscriptions } = migrateSubscriptions(
        { subscriptions: [netflixV1()] },
        1,
        TODAY,
      )
      expect(subscriptions[0].pauses).toEqual([])
    })

    it.each([
      [
        { iconUrl: '/logos/logo_netflix.webp' },
        { kind: 'preset', path: '/logos/logo_netflix.webp' },
      ],
      [
        { iconUrl: undefined, iconKey: 'water' },
        { kind: 'key', key: 'water' },
      ],
      [{ iconUrl: undefined }, undefined],
    ])('turns %o into the icon %o', (fields, icon) => {
      const { subscriptions } = migrateSubscriptions(
        { subscriptions: [netflixV1(fields)] },
        1,
        TODAY,
      )
      expect(subscriptions[0].icon).toEqual(icon)
    })

    it('drops the old fields and keeps everything else as it was', () => {
      const { subscriptions } = migrateSubscriptions(
        {
          subscriptions: [
            netflixV1({
              endDate: '2027-01-01',
              reminders: [{ id: 'r', daysBefore: 1, isEnabled: true }],
            }),
          ],
        },
        1,
        TODAY,
      )
      const upgraded = subscriptions[0] as unknown as Record<string, unknown>
      for (const old of ['price', 'currency', 'isPaused', 'iconUrl', 'iconKey']) {
        expect(upgraded).not.toHaveProperty(old)
      }
      expect(upgraded).toMatchObject({
        id: '1',
        name: 'Netflix',
        endDate: '2027-01-01',
        categoryId: 'entertainment',
        reminders: [{ id: 'r', daysBefore: 1, isEnabled: true }],
        createdAt: '2026-10-01T00:00:00.000Z',
      })
    })

    it('upgrades every subscription in the file', () => {
      const { subscriptions } = migrateSubscriptions(
        {
          subscriptions: [
            netflixV1(),
            netflixV1({ id: '2', name: 'Spotify', isPaused: true }),
          ],
        },
        1,
        TODAY,
      )
      expect(subscriptions.map((sub) => sub.pauses)).toEqual([[], [{ from: TODAY }]])
    })
  })

  describe('0 -> 1 -> 2', () => {
    it('a paused status ends as an open pause, without the old fields', () => {
      expect(
        migrateSubscriptions({ subscriptions: [netflixV0('inactive')] }, 0, TODAY),
      ).toEqual({ subscriptions: [{ ...netflixV2, pauses: [{ from: TODAY }] }] })
    })

    it.each(['active', 'trial'])('"%s" ends with no pauses', (status) => {
      expect(
        migrateSubscriptions({ subscriptions: [netflixV0(status)] }, 0, TODAY),
      ).toEqual({
        subscriptions: [netflixV2],
      })
    })
  })

  it('runs when the store loads a version 1 file', async () => {
    savedFiles.set(
      'subscriptions',
      JSON.stringify({
        state: { subscriptions: [netflixV1({ isPaused: true })] },
        version: 1,
      }),
    )
    await useSubscriptionStore.persist.rehydrate()
    expect(useSubscriptionStore.getState().subscriptions).toEqual([
      { ...netflixV2, pauses: [{ from: todayISO() }] },
    ])
  })

  it('leaves a current file alone', () => {
    const current = { subscriptions: [netflix] }
    expect(migrateSubscriptions(current, 2, TODAY)).toEqual(current)
  })
})

describe('restoreSubscription', () => {
  it('puts a deleted subscription back', () => {
    useSubscriptionStore.getState().deleteSubscription('1')
    useSubscriptionStore.getState().restoreSubscription(netflix)
    expect(ids()).toEqual(['2', '1'])
  })

  it('does not duplicate one that is already in the list', () => {
    useSubscriptionStore.getState().restoreSubscription(netflix)
    expect(ids()).toEqual(['1', '2'])
  })
})

describe('undo from the toast', () => {
  it('brings back the second of two deletes in a row', () => {
    deleteWithUndo(netflix)
    deleteWithUndo(spotify) // replaces Netflix's toast
    useToastStore.getState().toast?.action?.onClick()
    expect(ids()).toEqual(['2'])
  })
})
