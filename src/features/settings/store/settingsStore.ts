// DEPENDENCIES
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

// UTILS
import { fileStorage } from '@/shared/lib/fileStorage'
import { DEFAULT_CURRENCIES } from '@/shared/lib/currencies'

interface SettingsState {
  /** The currency Home shows totals in (the flag pill). Also the default for new subscriptions. */
  selectedCurrency: string
  /** The currencies offered first in the pickers. Editable from Settings later. */
  favoriteCurrencies: string[]
  setSelectedCurrency: (code: string) => void
  setFavoriteCurrencies: (codes: string[]) => void
}

/** User preferences, saved on the device as `aldia/settings.json`. */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      selectedCurrency: 'USD',
      favoriteCurrencies: DEFAULT_CURRENCIES.map((currency) => currency.code),
      setSelectedCurrency: (code) => set({ selectedCurrency: code }),
      setFavoriteCurrencies: (codes) => set({ favoriteCurrencies: codes }),
    }),
    // Same key as before; the old hand-saved format is not read, so settings reset once
    {
      name: 'settings',
      storage: createJSONStorage(() => fileStorage),
      // main.tsx loads it before the first render (see there)
      skipHydration: true,
    },
  ),
)
