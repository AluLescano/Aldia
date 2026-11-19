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
 * Upgrades a saved file to the current shape, one version step at a time (`persist` calls
 * it when the file's `version` is older than the store's). No steps right now: version 2
 * is the oldest shape left on any phone (the 0 -> 1 -> 2 steps went in 0.6.0, after every
 * tester had opened 0.4.0). The next shape change adds `version` back and an
 * `if (version < 3)` step.
 *
 * A step can be deleted once every phone has opened a build that ran it (the file is saved
 * in the new shape right after). Backups only exist since 0.5.0 (version 2).
 */
export function migrateSubscriptions(persisted: unknown) {
  return persisted as { subscriptions: Subscription[] }
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
      version: 2,
      migrate: (persisted) => migrateSubscriptions(persisted),
      // main.tsx loads it before the first render
      skipHydration: true,
    },
  ),
)
