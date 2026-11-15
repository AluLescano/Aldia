export interface SavedStore {
  state: unknown
  version: number
}

export interface Backup {
  app: 'aldia'
  format: 1
  exportedOn: string
  appVersion: string
  stores: {
    subscriptions: SavedStore
    categories: SavedStore
    settings: SavedStore
  }
}

export type BackupResult =
  { worked: true; backup: Backup } | { worked: false; reason: string }
