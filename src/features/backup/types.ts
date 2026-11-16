/**
 * One store's file exactly as Zustand `persist` saves it (`aldia/<name>.json`). `state` is
 * `unknown` on purpose: a backup comes from outside the app, so nothing in it is trusted until
 * the store's own `migrate` has loaded it.
 */
export interface SavedStore {
  state: unknown
  /** The store's `persist` version when it was saved (subscriptions is on 2). */
  version: number
}

/**
 * A backup file: the three saved stores as they were on the phone, plus a label saying what
 * the file is. Exchange rates are left out (they download again).
 */
export interface Backup {
  /** Always `'aldia'`: tells our backups apart from any other JSON file. */
  app: 'aldia'
  /** The shape of this wrapper, not of the data inside (each store has its own `version`). */
  format: 1
  /** `YYYY-MM-DD`, the local day it was exported. */
  exportedOn: string
  /** The app version that made it, e.g. `'0.4.0'`. Only informative. */
  appVersion: string
  stores: {
    subscriptions: SavedStore
    categories: SavedStore
    settings: SavedStore
  }
}

/**
 * What `readBackup` answers: the checked backup, or the reason it was refused, in Spanish,
 * ready to show to the user. Check `worked` first: TypeScript then knows which of the two
 * fields is there.
 */
export type BackupResult =
  { worked: true; backup: Backup } | { worked: false; reason: string }
