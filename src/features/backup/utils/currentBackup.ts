// STORES
import { useSubscriptionStore } from '@/features/subscriptions/store/subscriptionStore'
import { useCategoryStore } from '@/features/categories/store/categoryStore'
import { useSettingsStore } from '@/features/settings/store/settingsStore'

// UTILS
import { createBackup } from './backup'
import { storeSnapshot } from './storeSnapshot'

// TYPES
import type { Backup } from '../types'

/**
 * A backup of the app as it is right now: the three stores, saved the way `persist` saves
 * them. Used by the export, and by the import for its safety copy (what Deshacer restores).
 *
 * @param today `YYYY-MM-DD`, saved as `exportedOn`. Pass `todayISO()`.
 */
export function currentBackup(today: string): Backup {
  return createBackup(
    {
      subscriptions: storeSnapshot(useSubscriptionStore),
      categories: storeSnapshot(useCategoryStore),
      settings: storeSnapshot(useSettingsStore),
    },
    __APP_VERSION__,
    today,
  )
}
