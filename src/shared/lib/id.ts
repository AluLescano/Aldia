export function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  // Insecure context (http over LAN while developing): good enough for a local id
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
