// TYPES
import type { Backup } from '../types'

/** What a backup brings, in numbers the user recognizes. */
export interface BackupSummary {
  subscriptions: number
  /** Only the user's own categories: the 12 defaults come with every install, so they aren't news. */
  customCategories: number
}

// The array saved under `key` inside a store's state, or `[]` if it isn't there.
// `state` is `unknown` (the backup came from outside), so it's checked before reading.
function listIn(state: unknown, key: string): unknown[] {
  if (typeof state !== 'object' || state === null || !(key in state)) return []
  const list = (state as Record<string, unknown>)[key]
  return Array.isArray(list) ? list : []
}

// A category the user made: flagged `isCustom`, or with the `custom-` id addCategory gives it
function isCustomCategory(category: unknown): boolean {
  if (typeof category !== 'object' || category === null) return false
  if ('isCustom' in category && category.isCustom === true) return true
  return 'id' in category && typeof category.id === 'string' && category.id.startsWith('custom-')
}

/**
 * Counts what a checked backup holds, for the import dialog ("12 suscripciones · 2
 * categorías"). Works on old backups too: every subscriptions version keeps a `subscriptions`
 * array. Anything that doesn't look right counts as 0 instead of throwing; the store's own
 * `migrate` deals with the details on import.
 *
 * @example
 * backupSummary(backup) // { subscriptions: 12, customCategories: 2 }
 */
export function backupSummary(backup: Backup): BackupSummary {
  return {
    subscriptions: listIn(backup.stores.subscriptions.state, 'subscriptions').length,
    customCategories: listIn(backup.stores.categories.state, 'categories').filter(
      isCustomCategory,
    ).length,
  }
}
