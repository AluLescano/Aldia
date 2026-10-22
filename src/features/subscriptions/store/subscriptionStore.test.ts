import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useSubscriptionStore } from './subscriptionStore'
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
  price: 10,
  currency: 'USD',
  billingCycle: { type: 'every', interval: 1, unit: 'month' },
  firstBillDate: '2026-10-01',
  nextBillDate: '2026-11-01',
  categoryId: 'entertainment',
  reminders: [],
  status: 'active',
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
    expect(saved).toEqual({ state: { subscriptions: [spotify] }, version: 0 })
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
