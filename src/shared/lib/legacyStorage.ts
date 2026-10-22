/*
 * Before the stores moved to JSON files (PR #13), an older build saved them in localStorage
 * under these keys. The current app never reads them, so they're just leftovers.
 * `aldia_rates` is NOT here: ratesStore still lives in localStorage.
 */
const LEGACY_KEYS = ['aldia_subscriptions_v1', 'aldia_categories_v1', 'aldia_settings']

/**
 * Deletes the old build's localStorage data. Safe to run on every start: removing a key that
 * isn't there does nothing. Can go once no phone has the pre-JSON build anymore.
 */
export function clearLegacyStorage(): void {
  for (const key of LEGACY_KEYS) {
    localStorage.removeItem(key)
  }
}
