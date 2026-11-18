// DEPENDENCIES
import { fileStorage } from '@/shared/lib/fileStorage'

// TYPES
import type { Backup } from '../types'

// STORES
import { useSubscriptionStore } from '@/features/subscriptions/store/subscriptionStore'
import { useCategoryStore } from '@/features/categories/store/categoryStore'
import { useSettingsStore } from '@/features/settings/store/settingsStore'

/**
 * Replaces the app's data with a backup's, through the same path the app uses when it starts:
 * each store's `{ state, version }` is written to its file (all three, before anything
 * reloads), then the three stores `rehydrate()` from those files. So an older backup goes
 * through each store's own `migrate`, and the notifications resync by themselves (they
 * follow the stores). Check the file with `readBackup` first: this trusts what it gets.
 */
export async function applyBackup(backup: Backup): Promise<void> {
  for (const name of ['subscriptions', 'categories', 'settings'] as const) {
    await fileStorage.setItem(name, JSON.stringify(backup.stores[name]))
  }
  await Promise.all([
    useSubscriptionStore.persist.rehydrate(),
    useCategoryStore.persist.rehydrate(),
    useSettingsStore.persist.rehydrate(),
  ])
}

/**
 * The `persist` version each store is on in this app (Zustand's default 0 when a store never
 * set one): what `readBackup` compares a backup against to refuse newer ones.
 *
 * @example
 * readBackup(text, currentVersions()) // today: { subscriptions: 2, categories: 0, settings: 0 }
 */
export function currentVersions(): Record<keyof Backup['stores'], number> {
  return {
    subscriptions: useSubscriptionStore.persist.getOptions().version ?? 0,
    categories: useCategoryStore.persist.getOptions().version ?? 0,
    settings: useSettingsStore.persist.getOptions().version ?? 0,
  }
}
