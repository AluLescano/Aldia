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
  /**
   * `HH:MM`, the time every notification rings (one time for all, chosen in Ajustes later).
   * A file saved before this existed keeps the default: `persist` fills in missing fields.
   */
  reminderTime: string
  /**
   * The welcome flow was finished (or skipped): it never shows on open again. Files saved before
   * this existed get `false`, so people updating the app see it once.
   */
  hasSeenOnboarding: boolean
  /**
   * After an "Ahora no" in the welcome flow we ask once more, the first time a subscription is
   * saved with a notification. This marks that second ask: there is never a third. Android can't
   * tell us this, since our "Ahora no" never reaches its own prompt.
   */
  hasAskedForNotificationsAgain: boolean
  setSelectedCurrency: (code: string) => void
  setFavoriteCurrencies: (codes: string[]) => void
  setReminderTime: (time: string) => void
  // The two flags only go false → true, so their actions take no value
  finishOnboarding: () => void
  markNotificationsAskedAgain: () => void
}

/** User preferences, saved on the device as `aldia/settings.json`. */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      selectedCurrency: 'USD',
      favoriteCurrencies: DEFAULT_CURRENCIES.map((currency) => currency.code),
      reminderTime: '09:00',
      hasSeenOnboarding: false,
      hasAskedForNotificationsAgain: false,
      setSelectedCurrency: (code) => set({ selectedCurrency: code }),
      setFavoriteCurrencies: (codes) => set({ favoriteCurrencies: codes }),
      setReminderTime: (time) => set({ reminderTime: time }),
      finishOnboarding: () => set({ hasSeenOnboarding: true }),
      markNotificationsAskedAgain: () => set({ hasAskedForNotificationsAgain: true }),
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
