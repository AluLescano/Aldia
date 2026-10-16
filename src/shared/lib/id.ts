/**
 * A new unique id for something saved on the device (a subscription, a category).
 * Uses `crypto.randomUUID()` when available. Over plain http on the local network
 * (testing on the phone with the dev server) the browser hides it, so a
 * time + random fallback is used: unique enough for one device.
 */
export function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
