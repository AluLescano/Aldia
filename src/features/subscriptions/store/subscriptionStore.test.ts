import { beforeEach, describe, expect, it, vi } from 'vitest'

import { migrateSubscriptions, useSubscriptionStore } from './subscriptionStore'
import { useToastStore } from '@/shared/store/toastStore'
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
  schedule: [
    { from: '2026-10-01', billingCycle: { type: 'every', interval: 1, unit: 'month' } },
  ],
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
    expect(saved).toEqual({ state: { subscriptions: [spotify] }, version: 3 })
  })
})

describe('migrateSubscriptions', () => {
  // Netflix the way version 2 saved it: one first charge and one cycle
  const { schedule, ...rest } = netflix
  const netflixV2 = {
    ...rest,
    firstBillDate: schedule[0].from,
    billingCycle: schedule[0].billingCycle,
  }

  describe('2 -> 3', () => {
    it('turns the first charge and the cycle into the first entry of the schedule', () => {
      const { subscriptions } = migrateSubscriptions(
        { subscriptions: [{ ...netflixV2, billingCycle: { type: 'one-time' } }] },
        2,
      )
      expect(subscriptions[0].schedule).toEqual([
        { from: '2026-10-01', billingCycle: { type: 'one-time' } },
      ])
    })

    it('drops the old fields and keeps everything else as it was', () => {
      const { subscriptions } = migrateSubscriptions(
        {
          subscriptions: [
            {
              ...netflixV2,
              endDate: '2027-01-01',
              pauses: [{ from: '2026-11-01' }],
              reminders: [{ id: 'r', daysBefore: 1, isEnabled: true }],
            },
          ],
        },
        2,
      )
      const upgraded = subscriptions[0] as unknown as Record<string, unknown>
      expect(upgraded).not.toHaveProperty('firstBillDate')
      expect(upgraded).not.toHaveProperty('billingCycle')
      expect(upgraded).toMatchObject({
        id: '1',
        name: 'Netflix',
        priceHistory: netflix.priceHistory,
        endDate: '2027-01-01',
        pauses: [{ from: '2026-11-01' }],
        reminders: [{ id: 'r', daysBefore: 1, isEnabled: true }],
        createdAt: '2026-10-01T00:00:00.000Z',
      })
    })

    it('upgrades every subscription in the file', () => {
      const { subscriptions } = migrateSubscriptions(
        {
          subscriptions: [
            netflixV2,
            { ...netflixV2, id: '2', firstBillDate: '2026-10-15' },
          ],
        },
        2,
      )
      expect(subscriptions.map((sub) => sub.schedule[0].from)).toEqual([
        '2026-10-01',
        '2026-10-15',
      ])
    })
  })

  it('runs when the store loads a version 2 file', async () => {
    // Empty the store first: setState saves too, and would write over the planted file
    useSubscriptionStore.setState({ subscriptions: [] })
    savedFiles.set(
      'subscriptions',
      JSON.stringify({ state: { subscriptions: [netflixV2] }, version: 2 }),
    )
    await useSubscriptionStore.persist.rehydrate()
    expect(useSubscriptionStore.getState().subscriptions).toEqual([netflix])
  })

  it('leaves a current file alone', () => {
    const current = { subscriptions: [netflix] }
    expect(migrateSubscriptions(current, 3)).toEqual(current)
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
