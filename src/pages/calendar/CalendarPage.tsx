// DEPENDENCIES
import { useState } from 'react'

// STORES
import { useUIStore } from '@/shared/store/uiStore'

// HOOKS
import { useCalendarMonth } from '@/features/calendar/hooks/useCalendarMonth'
import { useMonthCharges } from '@/features/calendar/hooks/useMonthCharges'

// UTILS
import { todayISO } from '@/shared/lib/isoDate'
import { MONTHS } from '@/shared/lib/calendar'
import { ratesNote } from '@/shared/lib/exchangeRates'
import { countText } from '@/features/calendar/utils/countText'

// COMPONENTS
import Typography from '@/shared/ui/Typography/Typography'
import MonthlyExpenses from '@/features/homepage/components/MonthlyExpenses/MonthlyExpenses'
import MonthNav from '@/features/calendar/components/MonthNav/MonthNav'
import MonthGrid from '@/features/calendar/components/MonthGrid/MonthGrid'
import DaySheet from '@/features/calendar/components/DaySheet/DaySheet'
import CalendarLegend from '@/features/calendar/components/CalendarLegend/CalendarLegend'

// ASSETS
import styles from './CalendarPage.module.scss'

/**
 * The Calendario tab: what the shown month really charges, the month row, the grid of days
 * (swipe to change month) with its legend, and the tapped day's sheet. The month lives in
 * `useCalendarMonth`; its charges, trials and total come from `useMonthCharges`.
 */
export const CalendarPage = () => {
  const { container, emptyMonth } = styles
  const pushOverlay = useUIStore((state) => state.pushOverlay)

  const today = todayISO()
  const { view, direction, goToMonth, goToToday, isCurrentMonth } =
    useCalendarMonth(today)
  const {
    days,
    byDay,
    trials,
    subsById,
    monthTotal,
    hasTrial,
    isEmpty,
    currency,
    rates,
  } = useMonthCharges(view)

  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const monthName = MONTHS[view.month].toLowerCase()

  // The sheet closes first, so it isn't sitting there when the user comes back
  const openOverlay = (...args: Parameters<typeof pushOverlay>) => {
    setSelectedDate(null)
    pushOverlay(...args)
  }

  return (
    <div className={container}>
      <MonthlyExpenses
        title={`Cobros de ${monthName}`}
        amount={monthTotal.total}
        detail={countText(monthTotal.count)}
        note={ratesNote(monthTotal.converted, monthTotal.unconverted, rates, today)}
      />
      <MonthNav
        year={view.year}
        month={view.month}
        showToday={!isCurrentMonth}
        onPrevious={() => goToMonth(-1)}
        onNext={() => goToMonth(1)}
        onToday={goToToday}
      />
      <MonthGrid
        days={days}
        month={view.month}
        today={today}
        byDay={byDay}
        subsById={subsById}
        trials={trials}
        onSelectDay={setSelectedDate}
        onSwipe={goToMonth}
        direction={direction}
      />
      <CalendarLegend hasToday={isCurrentMonth} hasTrial={hasTrial} />
      {isEmpty && (
        <Typography variant="body" size="sm" className={emptyMonth}>
          {`Nada se cobra en ${monthName}. Toca un día para agregar una subscripción.`}
        </Typography>
      )}
      <DaySheet
        isOpen={selectedDate !== null}
        date={selectedDate}
        charges={selectedDate ? (byDay.get(selectedDate) ?? []) : []}
        trials={selectedDate ? (trials.get(selectedDate) ?? []) : []}
        subsById={subsById}
        currency={currency}
        rates={rates}
        onClose={() => setSelectedDate(null)}
        onOpenSub={(id) => openOverlay('subscription-form', { subscriptionId: id })}
        onAddSub={(date) => openOverlay('preset-picker', { firstBillDate: date })}
      />
    </div>
  )
}
