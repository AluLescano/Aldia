// TYPES
import type { PersistOptions } from 'zustand/middleware'
import type { SavedStore } from '../types'

/** The two things this needs from a store made with `persist`. */
interface PersistedStore<S, U> {
  getState: () => S
  persist: { getOptions: () => Partial<PersistOptions<S, U>> }
}

/**
 * One store as its saved file would hold it, `{ state, version }`, built from memory: the
 * state goes through the store's own `partialize`, and the version is the store's `version`
 * (Zustand's default 0 when it never set one). It's what goes into a backup's `stores`.
 * Actions are functions, so they drop out once the backup becomes JSON, like in persist's file.
 *
 * @example
 * storeSnapshot(useSubscriptionStore) // { state: { subscriptions: [...] }, version: 2 }
 */
export function storeSnapshot<S, U>(store: PersistedStore<S, U>): SavedStore {
  const { partialize, version } = store.persist.getOptions()
  const state = partialize ? partialize(store.getState()) : store.getState()
  return { state, version: version ?? 0 }
}
