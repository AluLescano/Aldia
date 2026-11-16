import type { Backup, SavedStore } from '../types'

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

export function backupFileName(today: string): string {
  return `aldia-backup-${today}.json`
}
