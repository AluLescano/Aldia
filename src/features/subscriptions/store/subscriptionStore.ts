// DEPENDENCIES
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

// UTILS
import { fileStorage } from '@/shared/lib/fileStorage'

// TYPES
import type { Subscription } from '@/shared/types'

interface SubscriptionState {
  subscriptions: Subscription[]
  addSubscription: (sub: Subscription) => void
  deleteSubscription: (id: string) => void
  /**
   * Puts a deleted subscription back (the toast's "Deshacer"). Does nothing if one with
   * the same id is already in the list, so a double undo can't duplicate it.
   */
  restoreSubscription: (sub: Subscription) => void
  /** Merges the given fields into one subscription. A field set to `undefined` is cleared. */
  updateSubscription: (id: string, updatedSub: Partial<Subscription>) => void
  /** Moves every subscription of one category to another (used when a category is deleted). */
  reassignCategory: (fromId: string, toId: string) => void
}

/**
 * Upgrades a saved file to the current shape, one version step at a time
 * (`persist` calls it when the file's `version` is older than the store's).
 * - 0 -> 1: the stored `status` becomes `isPaused`; the old stored `nextBillDate` is dropped.
 */
export function migrateSubscriptions(persisted: unknown, version: number) {
  let state = persisted as { subscriptions: unknown[] }
  if (version < 1) {
    state = { subscriptions: (state.subscriptions as SubscriptionV0[]).map(toVersion1) }
  }
  return state as { subscriptions: Subscription[] }
}

/** A subscription as version 0 saved it. */
type SubscriptionV0 = Omit<Subscription, 'isPaused'> & {
  status: string
  nextBillDate?: string
}

const toVersion1 = ({ status, ...sub }: SubscriptionV0): Subscription => {
  const upgraded = { ...sub, isPaused: status === 'inactive' }
  delete upgraded.nextBillDate
  return upgraded
}

/** All the user's subscriptions, saved on the device as `aldia/subscriptions.json`. */
export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set) => ({
      subscriptions: [],

      addSubscription: (newSub) =>
        set((state) => ({ subscriptions: [...state.subscriptions, newSub] })),

      deleteSubscription: (id) =>
        set((state) => ({
          subscriptions: state.subscriptions.filter((sub) => sub.id !== id),
        })),

      restoreSubscription: (deleted) =>
        set((state) =>
          state.subscriptions.some((sub) => sub.id === deleted.id)
            ? state
            : { subscriptions: [...state.subscriptions, deleted] },
        ),

      updateSubscription: (id, updatedSub) =>
        set((state) => ({
          subscriptions: state.subscriptions.map((sub) =>
            sub.id === id ? { ...sub, ...updatedSub } : sub,
          ),
        })),

      reassignCategory: (fromId, toId) =>
        set((state) => ({
          subscriptions: state.subscriptions.map((sub) =>
            sub.categoryId === fromId ? { ...sub, categoryId: toId } : sub,
          ),
        })),
    }),
    {
      name: 'subscriptions',
      storage: createJSONStorage(() => fileStorage),
      partialize: (state) => ({ subscriptions: state.subscriptions }),
      // Bump it, and add a step to `migrateSubscriptions`, whenever the saved shape changes
      version: 1,
      migrate: migrateSubscriptions,
      // main.tsx loads it before the first render
      skipHydration: true,
    },
  ),
)
