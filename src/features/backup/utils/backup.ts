// TYPES
import type { Backup, BackupResult, SavedStore } from '../types'

/**
 * Whether a value has the shape `persist` saves: an object with a `state` object and a
 * numeric `version`. A type guard: after a `true`, TypeScript treats `value` as a `SavedStore`.
 *
 * @example
 * isSavedStore({ state: { subscriptions: [] }, version: 2 }) // true
 * isSavedStore({ state: {}, version: '2' })                  // false: the version is text
 */
export function isSavedStore(value: unknown): value is SavedStore {
  if (value === null || typeof value !== 'object') {
    return false
  } else if (
    !('state' in value) ||
    typeof value.state !== 'object' ||
    value.state === null
  ) {
    return false
  } else if (!('version' in value) || typeof value.version !== 'number') {
    return false
  }
  return true
}

/**
 * Builds a backup from the three saved stores. Pure: pass `todayISO()` as `today`.
 *
 * @param stores each store's file as `persist` saved it (`{ state, version }`).
 * @param appVersion the app version that makes the backup, e.g. `'0.4.0'`.
 * @param today `YYYY-MM-DD`, saved as `exportedOn`.
 */
export function createBackup(
  stores: Backup['stores'],
  appVersion: string,
  today: string,
): Backup {
  return {
    app: 'aldia',
    format: 1,
    exportedOn: today,
    appVersion,
    stores,
  }
}

/**
 * The name the exported file gets. One place, so the export and the tests always agree.
 *
 * @example
 * backupFileName('2026-11-15') // 'aldia-backup-2026-11-15.json'
 */
export function backupFileName(today: string): string {
  return `aldia-backup-${today}.json`
}

/**
 * Checks a file's text before anything is imported, and refuses it with a reason the user can
 * read: not JSON or not ours ("no es un backup de Aldia"), a store missing or broken
 * ("incompleto o dañado"), or a store saved by a newer app than this one ("Actualiza la app").
 * It only checks the wrapper and each store's `{ state, version }`; what's inside `state` is
 * left to each store's `migrate`, which also upgrades older versions.
 *
 * @param text the whole file, as read from disk.
 * @param currentVersions this app's `persist` version for each store
 * (`useSubscriptionStore.persist.getOptions().version` and so on).
 * @example
 * const result = readBackup(text, { subscriptions: 2, categories: 0, settings: 0 })
 * if (!result.worked) return result.reason // show it to the user
 * result.backup.stores.subscriptions // checked: { state, version }
 */
export function readBackup(
  text: string,
  currentVersions: Record<keyof Backup['stores'], number>,
): BackupResult {
  let data: unknown

  try {
    data = JSON.parse(text)
  } catch {
    return { worked: false, reason: 'Este archivo no es un backup de Aldia.' }
  }
  if (typeof data !== 'object' || data === null) {
    return { worked: false, reason: 'Este archivo no es un backup de Aldia.' }
  }
  if (
    !('app' in data) ||
    data.app !== 'aldia' ||
    !('format' in data) ||
    data.format !== 1 ||
    !('exportedOn' in data) ||
    typeof data.exportedOn !== 'string' ||
    !('appVersion' in data) ||
    typeof data.appVersion !== 'string'
  ) {
    return { worked: false, reason: 'Este archivo no es un backup de Aldia.' }
  }
  if (!('stores' in data) || typeof data.stores !== 'object' || data.stores === null) {
    return { worked: false, reason: 'El backup está incompleto o dañado.' }
  }

  const stores = data.stores as Record<string, unknown>

  for (const name of ['subscriptions', 'categories', 'settings'] as const) {
    const store = stores[name]

    if (!isSavedStore(store)) {
      return { worked: false, reason: 'El backup está incompleto o dañado.' }
    }

    if (store.version > currentVersions[name]) {
      return {
        worked: false,
        reason:
          'Este backup es de una versión más nueva de Aldia. Actualiza la app para importarlo.',
      }
    }
  }

  return { worked: true, backup: data as Backup }
}
