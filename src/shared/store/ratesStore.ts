import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { fetchExchangeRates, type ExchangeRates } from '@/shared/lib/exchangeRates'
import { todayISO } from '@/shared/lib/isoDate'

interface RatesState {
  /** The last downloaded rates, or `null` before the first successful download. */
  rates: ExchangeRates | null
  /** The local day of the last successful download, as `YYYY-MM-DD`. */
  fetchedOn: string | null
  /**
   * Downloads the rates if they were not downloaded today. Offline or on error it
   * keeps the last saved rates, so totals keep working with older numbers.
   */
  refreshIfStale: () => Promise<void>
}

// Opening the app and coming back to it can both ask at once: only one download runs
let pending: Promise<void> | null = null

/**
 * Exchange rates for converting totals to the selected currency. Saved in localStorage
 * (`aldia_rates`), so it works offline with the last rates. `App.tsx` calls
 * `refreshIfStale` on open and whenever the app comes back to the screen.
 *
 * @example
 * const rates = useRatesStore((state) => state.rates)
 */
export const useRatesStore = create<RatesState>()(
  persist(
    (set, get) => ({
      rates: null,
      fetchedOn: null,

      refreshIfStale: async () => {
        if (get().fetchedOn === todayISO()) return
        if (pending) return pending // a download is already on its way

        const download = async () => {
          try {
            const rates = await fetchExchangeRates()
            set({ rates, fetchedOn: todayISO() })
          } catch {
            // offline: keep the last saved rates
          } finally {
            pending = null
          }
        }
        pending = download()
        return pending
      },
    }),
    { name: 'aldia_rates' },
  ),
)
