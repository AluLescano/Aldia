import { create } from 'zustand'
import { loadFromStorage, saveToStorage } from '@/shared/lib/storage'
import { DEFAULT_CURRENCIES } from '@/shared/lib/currencies'

const STORAGE_KEY = 'aldia_settings'

// The shape of data we save to localStorage
interface PersistedSettings {
  selectedCurrency: string
  favoriteCurrencies: string[]
}

// The full store interface (data + action functions)
interface SettingsState {
  selectedCurrency: string
  favoriteCurrencies: string[]
  setSelectedCurrency: (code: string) => void
  setFavoriteCurrencies: (codes: string[]) => void
}

// 1. Load persisted data from storage on app start (or fall back to defaults)
const initialSettings = loadFromStorage<PersistedSettings>(STORAGE_KEY, {
  selectedCurrency: 'USD',
  favoriteCurrencies: DEFAULT_CURRENCIES.map((c) => c.code),
})

// 2. Create the Zustand hook
export const useSettingsStore = create<SettingsState>((set) => ({
  // State
  selectedCurrency: initialSettings.selectedCurrency,
  favoriteCurrencies: initialSettings.favoriteCurrencies,

  // Actions
  setSelectedCurrency: (code: string) =>
    set((state) => {
      // Save to localStorage so it survives page reloads
      saveToStorage(STORAGE_KEY, {
        selectedCurrency: code,
        favoriteCurrencies: state.favoriteCurrencies,
      })
      // Return the updated state
      return { selectedCurrency: code }
    }),

  setFavoriteCurrencies: (codes: string[]) =>
    set((state) => {
      saveToStorage(STORAGE_KEY, {
        selectedCurrency: state.selectedCurrency,
        favoriteCurrencies: codes,
      })
      return { favoriteCurrencies: codes }
    }),
}))
