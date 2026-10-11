import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Subscription } from '@/shared/types'

// 1. Define the shape of our store
interface SubscriptionState {
  subscriptions: Subscription[]
  addSubscription: (sub: Subscription) => void
  deleteSubscription: (id: string) => void
  updateSubscription: (id: string, updatedSub: Partial<Subscription>) => void
}

// 2. Create the store
export const useSubscriptionStore = create<SubscriptionState>()(
  // 3. We use the 'persist' middleware to automatically save to localStorage
  persist(
    (set) => ({
      // Initial state
      subscriptions: [],

      // Actions
      addSubscription: (newSub) =>
        set((state) => ({
          // Spread the old array and add the new item at the end
          subscriptions: [...state.subscriptions, newSub],
        })),

      deleteSubscription: (id) =>
        set((state) => ({
          // Filter out the subscription with the matching ID
          subscriptions: state.subscriptions.filter((sub) => sub.id !== id),
        })),

      updateSubscription: (id, updatedSub) =>
        set((state) => ({
          // Map over the array, update the matching one, leave the rest alone
          subscriptions: state.subscriptions.map((sub) =>
            sub.id === id ? { ...sub, ...updatedSub } : sub,
          ),
        })),
    }),
    {
      name: 'aldia_subscriptions_v1', // The key used in localStorage (defined in README)
    }
  )
)