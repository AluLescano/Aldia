/**
 * Type-safe, crash-resilient LocalStorage wrapper
 */

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return defaultValue
    return JSON.parse(raw) as T
  } catch (err) {
    console.error(`Failed to load key "${key}" from localStorage:`, err)
    return defaultValue
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    console.error(`Failed to save key "${key}" to localStorage:`, err)
  }
}

export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (err) {
    console.error(`Failed to remove key "${key}" from localStorage:`, err)
  }
}
