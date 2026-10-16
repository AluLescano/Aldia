// DEPENDENCIES
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// TYPES
import type { Subscription } from '@/shared/types'

interface SubscriptionState {
  subscriptions: Subscription[]
  /** The last deleted subscription, kept (not saved) so Home can offer to undo it. */
  lastDeleted: Subscription | null
  addSubscription: (sub: Subscription) => void
  /** Removes a subscription and remembers it as `lastDeleted`. */
  deleteSubscription: (id: string) => void
  /** Puts `lastDeleted` back in the list. Does nothing if there is none. */
  undoDelete: () => void
  /** Forgets `lastDeleted` (when the undo toast closes). */
  clearLastDeleted: () => void
  /** Merges the given fields into one subscription. A field set to `undefined` is cleared. */
  updateSubscription: (id: string, updatedSub: Partial<Subscription>) => void
  /** Moves every subscription of one category to another (used when a category is deleted). */
  reassignCategory: (fromId: string, toId: string) => void
}

/** All the user's subscriptions, saved on the device (`aldia_subscriptions_v1`). */
export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set) => ({
      subscriptions: [],
      lastDeleted: null,

      addSubscription: (newSub) =>
        set((state) => ({ subscriptions: [...state.subscriptions, newSub] })),

      deleteSubscription: (id) =>
        set((state) => ({
          subscriptions: state.subscriptions.filter((sub) => sub.id !== id),
          lastDeleted: state.subscriptions.find((sub) => sub.id === id) ?? null,
        })),

      undoDelete: () =>
        set((state) =>
          state.lastDeleted
            ? {
                subscriptions: [...state.subscriptions, state.lastDeleted],
                lastDeleted: null,
              }
            : state,
        ),

      clearLastDeleted: () => set({ lastDeleted: null }),

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
      name: 'aldia_subscriptions_v1',
      partialize: (state) => ({ subscriptions: state.subscriptions }), // lastDeleted is not saved
    },
  ),
)
