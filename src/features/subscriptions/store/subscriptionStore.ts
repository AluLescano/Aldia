// DEPENDENCIES
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

// UTILS
import { fileStorage } from '@/shared/lib/fileStorage'

// TYPES
import type { BillingCycle, Subscription } from '@/shared/types'

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
 * it when the file's `version` is older than the store's). Version 2 is the oldest shape
 * left on any phone (the 0 -> 1 -> 2 steps went in 0.6.0, after every tester had opened
 * 0.4.0), and backups only exist since 0.5.0 (also version 2).
 * - 2 -> 3: `firstBillDate` + `billingCycle` become the first entry of `schedule`.
 *
 * A step can be deleted once every phone has opened a build that ran it (the file is saved
 * in the new shape right after). Add the next one as `if (version < 4)`, after this one.
 */
export function migrateSubscriptions(persisted: unknown, version: number) {
  let state = persisted as { subscriptions: unknown[] }
  if (version < 3) {
    state = { subscriptions: (state.subscriptions as SubscriptionV2[]).map(toVersion3) }
  }
  return state as { subscriptions: Subscription[] }
}

/** A subscription as version 2 saved it: one first charge and one cycle for its whole life. */
type SubscriptionV2 = Omit<Subscription, 'schedule'> & {
  firstBillDate: string
  billingCycle: BillingCycle
}

const toVersion3 = ({
  firstBillDate,
  billingCycle,
  ...sub
}: SubscriptionV2): Subscription => ({
  ...sub,
  schedule: [{ from: firstBillDate, billingCycle }],
})

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
      version: 3,
      migrate: (persisted, version) => migrateSubscriptions(persisted, version),
      // main.tsx loads it before the first render
      skipHydration: true,
    },
  ),
)
