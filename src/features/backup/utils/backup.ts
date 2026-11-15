import type { SavedStore } from '../types'

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
