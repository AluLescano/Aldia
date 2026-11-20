import { describe, expect, it, vi } from 'vitest'

import { storeSnapshot } from './storeSnapshot'
import { useSubscriptionStore } from '@/features/subscriptions/store/subscriptionStore'
import { useCategoryStore } from '@/features/categories/store/categoryStore'

// The real stores save through fileStorage, which needs the Capacitor plugin. Tests run in
// plain Node, so it's swapped for one that saves nothing
vi.mock('@/shared/lib/fileStorage', () => ({
  fileStorage: {
    getItem: async () => null,
    setItem: async () => {},
    removeItem: async () => {},
  },
}))

// A made-up store with only what storeSnapshot reads
const fakeStore = <S, U>(
  state: S,
  options: { partialize?: (s: S) => U; version?: number },
) => ({
  getState: () => state,
  persist: { getOptions: () => options },
})

describe('storeSnapshot', () => {
  it('saves only what partialize keeps, with the store version', () => {
    const store = fakeStore(
      { items: [1, 2], draft: 'not saved' },
      { partialize: (s) => ({ items: s.items }), version: 3 },
    )

    expect(storeSnapshot(store)).toEqual({ state: { items: [1, 2] }, version: 3 })
  })

  it('saves the whole state when there is no partialize', () => {
    const store = fakeStore({ theme: 'dark' }, { version: 1 })

    expect(storeSnapshot(store)).toEqual({ state: { theme: 'dark' }, version: 1 })
  })

  it('uses version 0 when the store never set one (Zustand’s default)', () => {
    const store = fakeStore({ theme: 'dark' }, {})

    expect(storeSnapshot(store).version).toBe(0)
  })

  it('reads the real subscriptions store: the list only, version 3', () => {
    const snapshot = storeSnapshot(useSubscriptionStore)

    expect(snapshot.version).toBe(3)
    expect(Object.keys(snapshot.state as object)).toEqual(['subscriptions'])
  })

  it('reads the real categories store: the whole state, version 0', () => {
    const snapshot = storeSnapshot(useCategoryStore)

    expect(snapshot.version).toBe(0)
    expect(
      (snapshot.state as { categories: unknown[] }).categories.length,
    ).toBeGreaterThan(0)
  })
})
