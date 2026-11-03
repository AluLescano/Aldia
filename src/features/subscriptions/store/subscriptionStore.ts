// DEPENDENCIES
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

// UTILS
import { fileStorage } from '@/shared/lib/fileStorage'
import { todayISO } from '@/shared/lib/isoDate'

// TYPES
import type { CurrencyCode, IconKey, Subscription } from '@/shared/types'

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
 * - 1 -> 2: `price` + `currency` become the first entry of `priceHistory` (from the first
 *   charge), `isPaused` becomes `pauses` and `iconUrl` / `iconKey` become `icon`.
 *
 * @param today `YYYY-MM-DD`: a paused subscription's pause starts on the day it's upgraded,
 * since version 1 never saved when it was paused. Tests pass a fixed day.
 *
 * A step can be deleted once every phone has opened a build that ran it (the file is saved
 * in the new shape right after). Only the testers ever had version 0 or 1 data: both steps
 * go once they've opened 0.3.0 (tracked in the vault's Active Priorities).
 */
export function migrateSubscriptions(
  persisted: unknown,
  version: number,
  today: string = todayISO(),
) {
  let state = persisted as { subscriptions: unknown[] }
  if (version < 1) {
    state = { subscriptions: (state.subscriptions as SubscriptionV0[]).map(toVersion1) }
  }
  if (version < 2) {
    state = {
      subscriptions: (state.subscriptions as SubscriptionV1[]).map((sub) =>
        toVersion2(sub, today),
      ),
    }
  }
  return state as { subscriptions: Subscription[] }
}

/** A subscription as version 1 saved it: one price, a paused flag, two icon fields. */
type SubscriptionV1 = Omit<Subscription, 'priceHistory' | 'pauses' | 'icon'> & {
  price: number
  currency: CurrencyCode
  isPaused: boolean
  iconUrl?: string
  iconKey?: IconKey
}

/** A subscription as version 0 saved it. */
type SubscriptionV0 = Omit<SubscriptionV1, 'isPaused'> & {
  status: string
  nextBillDate?: string
}

const toVersion1 = ({ status, ...sub }: SubscriptionV0): SubscriptionV1 => {
  const upgraded = { ...sub, isPaused: status === 'inactive' }
  delete upgraded.nextBillDate
  return upgraded
}

const toVersion2 = (
  { price, currency, isPaused, iconUrl, iconKey, ...sub }: SubscriptionV1,
  today: string,
): Subscription => ({
  ...sub,
  priceHistory: [{ from: sub.firstBillDate, price, currency }],
  pauses: isPaused ? [{ from: today }] : [],
  icon: iconUrl
    ? { kind: 'preset', path: iconUrl }
    : iconKey
      ? { kind: 'key', key: iconKey }
      : undefined,
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
      version: 2,
      // persist passes (file, version): `today` takes its default
      migrate: (persisted, version) => migrateSubscriptions(persisted, version),
      // main.tsx loads it before the first render
      skipHydration: true,
    },
  ),
)
