// DEPENDENCIES
import { useMemo } from 'react'

// STORES
import { useSubscriptionStore } from '@/features/subscriptions/store/subscriptionStore'
import { useSettingsStore } from '@/features/settings/store/settingsStore'
import { useRatesStore } from '@/shared/store/ratesStore'

// UTILS
import { getMonthGrid } from '@/shared/lib/calendar'
import { chargesByDay } from '../utils/chargesByDay'
import { chargesTotal } from '../utils/chargesTotal'
import { trialsByDay } from '../utils/trialsByDay'

// TYPES
import type { ShownMonth } from './useCalendarMonth'

/**
 * Everything the Calendario shows for one month: the 42 grid days, each day's charges and
 * free trials, the subscriptions by id (a charge only carries its id), and what the month
 * itself really charges (only its own days, not the neighbour months' days the grid also
 * shows; a yearly charge counts whole on its month, unlike Home's average). Rebuilt only
 * when the month, the subscriptions, the currency or the rates change.
 *
 * @example
 * const { days, byDay, trials, monthTotal, isEmpty } = useMonthCharges(view)
 */
export function useMonthCharges(view: ShownMonth) {
  const subscriptions = useSubscriptionStore((state) => state.subscriptions)
  const currency = useSettingsStore((state) => state.selectedCurrency)
  const rates = useRatesStore((state) => state.rates)

  const days = useMemo(() => getMonthGrid(view.year, view.month), [view.year, view.month])
  const first = days[0]
  const last = days[days.length - 1]

  const byDay = useMemo(
    () => chargesByDay(subscriptions, first, last),
    [subscriptions, first, last],
  )
  const trials = useMemo(
    () => trialsByDay(subscriptions, first, last),
    [subscriptions, first, last],
  )
  const subsById = useMemo(
    () => new Map(subscriptions.map((sub) => [sub.id, sub])),
    [subscriptions],
  )

  const monthPrefix = `${view.year}-${String(view.month + 1).padStart(2, '0')}-` // "2026-11-"
  const monthTotal = useMemo(() => {
    const monthCharges = [...byDay]
      .filter(([date]) => date.startsWith(monthPrefix))
      .flatMap(([, charges]) => charges)
    return chargesTotal(monthCharges, currency, rates)
  }, [byDay, monthPrefix, currency, rates])

  const hasTrial = [...trials.keys()].some((date) => date.startsWith(monthPrefix))
  const hasCharges = [...byDay.keys()].some((date) => date.startsWith(monthPrefix))

  return {
    days,
    byDay,
    trials,
    subsById,
    monthTotal,
    /** Some day of the month is a free trial day (the legend says so). */
    hasTrial,
    /** Nothing at all happens this month: no charge (paused ones count) and no trial. */
    isEmpty: !hasCharges && !hasTrial,
    currency,
    rates,
  }
}
