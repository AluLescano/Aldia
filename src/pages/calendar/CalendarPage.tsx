// HOOKS
import { useMemo, useState } from 'react'
import { useSubscriptionStore } from '@/features/subscriptions/store/subscriptionStore'
import { useUIStore } from '@/shared/store/uiStore'
import { useSettingsStore } from '@/features/settings/store/settingsStore'
import { useRatesStore } from '@/shared/store/ratesStore'

// UTILS
import { parseISODate, todayISO } from '@/shared/lib/isoDate'
import { getMonthGrid, MONTHS } from '@/shared/lib/calendar'
import { ratesNote } from '@/shared/lib/exchangeRates'
import { chargesByDay } from '@/features/calendar/utils/chargesByDay'
import { chargesTotal } from '@/features/calendar/utils/chargesTotal'
import { countText } from '@/features/calendar/utils/countText'

// COMPONENTS
import MonthlyExpenses from '@/features/homepage/components/MonthlyExpenses/MonthlyExpenses'
import MonthNav from '@/features/calendar/components/MonthNav/MonthNav'
import MonthGrid from '@/features/calendar/components/MonthGrid/MonthGrid'
import DaySheet from '@/features/calendar/components/DaySheet/DaySheet'

// ASSETS
import styles from './CalendarPage.module.scss'

export const CalendarPage = () => {
  const { container } = styles

  const pushOverlay = useUIStore((state) => state.pushOverlay)
  const selectedCurrency = useSettingsStore((state) => state.selectedCurrency)
  const rates = useRatesStore((state) => state.rates)

  const today = todayISO()
  const start = parseISODate(today)!
  // The month on screen ({ year, month 0-11 }). It lives here because the grid, the day sheet
  // and the total will all read it
  const [view, setView] = useState({ year: start.getFullYear(), month: start.getMonth() })
  const subscriptions = useSubscriptionStore((state) => state.subscriptions)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // Rebuilt only when the month or the subscriptions change, not on every render
  const days = useMemo(() => getMonthGrid(view.year, view.month), [view.year, view.month])
  const byDay = useMemo(
    () => chargesByDay(subscriptions, days[0], days[days.length - 1]),
    [subscriptions, days],
  )
  // A charge only carries its subscription's id: this finds the sub for its logo
  const subsById = useMemo(
    () => new Map(subscriptions.map((sub) => [sub.id, sub])),
    [subscriptions],
  )

  // What the shown month really charges: only its own days, not the neighbour months' days
  // the grid also shows. A yearly charge counts whole on its month (unlike Home's average)
  const monthTotal = useMemo(() => {
    const prefix = `${view.year}-${String(view.month + 1).padStart(2, '0')}-` // "2026-11-"
    const monthCharges = [...byDay]
      .filter(([date]) => date.startsWith(prefix))
      .flatMap(([, charges]) => charges)
    return chargesTotal(monthCharges, selectedCurrency, rates)
  }, [byDay, view.year, view.month, selectedCurrency, rates])

  const selectedCharges = selectedDate ? (byDay.get(selectedDate) ?? []) : []

  const goToMonth = (delta: number) => {
    const next = new Date(view.year, view.month + delta, 1)
    setView({ year: next.getFullYear(), month: next.getMonth() })
  }

  const goToToday = () => {
    setView({ year: start.getFullYear(), month: start.getMonth() })
  }

  const isCurrentMonth =
    view.year === start.getFullYear() && view.month === start.getMonth()

  return (
    <div className={container}>
      <MonthlyExpenses
        title={`Cobros de ${MONTHS[view.month].toLowerCase()}`}
        amount={monthTotal.total}
        detail={countText(monthTotal.count)}
        note={ratesNote(monthTotal.converted, monthTotal.unconverted, rates, today)}
      />
      <MonthNav
        year={view.year}
        month={view.month}
        showToday={!isCurrentMonth}
        onPrevious={() => goToMonth(-1)}
        onNext={() => goToMonth(+1)}
        onToday={goToToday}
      />
      <MonthGrid
        days={days}
        month={view.month}
        today={today}
        byDay={byDay}
        subsById={subsById}
        onSelectDay={setSelectedDate}
      />
      <DaySheet
        isOpen={selectedDate !== null}
        date={selectedDate}
        charges={selectedCharges}
        dayTotal={chargesTotal(selectedCharges, selectedCurrency, rates)}
        currency={selectedCurrency}
        onClose={() => setSelectedDate(null)}
        subsById={subsById}
        onOpenSub={(id) => {
          setSelectedDate(null)
          pushOverlay('subscription-form', { subscriptionId: id })
        }}
        onAddSub={(date) => {
          setSelectedDate(null)
          pushOverlay('preset-picker', { firstBillDate: date })
        }}
      />
    </div>
  )
}
