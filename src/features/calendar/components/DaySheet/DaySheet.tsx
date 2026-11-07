// TYPES
import type { ReactNode } from 'react'
import type { Charge } from '@/features/subscriptions/utils/subscriptionHistory'
import type { ExchangeRates } from '@/shared/lib/exchangeRates'
import type { CurrencyCode, Subscription } from '@/shared/types'

// UTILS
import { dayAndMonth } from '@/shared/lib/calendar'
import { getCurrencySymbol } from '@/shared/lib/currencies'
import { ratesNote } from '@/shared/lib/exchangeRates'
import { formatDayMonth } from '@/shared/lib/formatDate'
import { todayISO } from '@/shared/lib/isoDate'
import { formatBillingCycle } from '@/features/subscriptions/utils/billingCycle'
import {
  chargeInCurrency,
  type ShownPrice,
} from '@/features/calendar/utils/chargeInCurrency'
import { chargesTotal } from '@/features/calendar/utils/chargesTotal'
import { daySummary } from '@/features/calendar/utils/countText'

// COMPONENTS
import BottomSheet from '@/shared/ui/BottomSheet/BottomSheet'
import Button from '@/shared/ui/Button/Button'
import SubscriptionRow from '@/features/subscriptions/components/SubscriptionRow/SubscriptionRow'
import Typography from '@/shared/ui/Typography/Typography'

// ASSETS
import styles from './DaySheet.module.scss'

const { list, rowButton, mutedLine, trialLine, emptyText, total, totalNote } = styles

interface Props {
  /** Shows the sheet. */
  isOpen: boolean
  /** `YYYY-MM-DD`, the tapped day. `null` while no day is open. */
  date: string | null
  /** That day's charges, from `chargesByDay`. */
  charges: Charge[]
  /** The subs on a free trial that day, from `trialsByDay`. */
  trials: Subscription[]
  /** Every subscription by id: a charge only carries its `subscriptionId`. */
  subsById: Map<string, Subscription>
  /** The currency picked at the top: the rows and the day total show it. */
  currency: CurrencyCode
  /** To convert each charge into `currency`. */
  rates: ExchangeRates | null
  /** Backdrop, Escape, back button or dragging it down. The page clears the date. */
  onClose: () => void
  /** A row was tapped: the page closes the sheet and opens that subscription's form. */
  onOpenSub: (subscriptionId: string) => void
  /** "Agregar una subscripción": the page opens the preset picker starting on this day. */
  onAddSub: (date: string) => void
}

interface RowProps {
  sub: Subscription
  /** The line under the name, already styled. */
  subLine: ReactNode
  onOpen: () => void
  /** Missing: the row says "Gratis" (a trial day). */
  price?: ShownPrice
  isPaused?: boolean
}

// One tappable row: the same look as Home's cards, inside a button that opens the sub
const DayRow = ({ sub, subLine, onOpen, price, isPaused }: RowProps) => (
  <Button variant="secondary" width="full" onClick={onOpen} className={rowButton}>
    <SubscriptionRow
      icon={sub.icon}
      name={sub.name}
      subLine={subLine}
      amount={price?.amount}
      currencySymbol={price?.currencySymbol}
      priceNote={price?.note}
      isPaused={isPaused}
    />
  </Button>
)

/**
 * The tapped day's sheet in the Calendario: the date as its title, a summary under it
 * ("2 cobros · 1 prueba gratis"), and one row per trial and charge (`SubscriptionRow`, the
 * same look as Home's cards):
 * - free trials running that day first, as "Gratis" rows (not on their last day: that's the
 *   first charge, already a row);
 * - each charge at its own price (a yearly sub its whole year, not a monthly share) in the
 *   picked currency, the original under it when converted, saying "Pausada", "Fin de prueba:
 *   primer cobro" or the cycle;
 * - "Total del día" with 2 or more paying charges.
 *
 * Tapping a row opens that subscription to edit it. Every day offers "Agregar una
 * subscripción", starting on it.
 *
 * @example
 * <DaySheet
 *   isOpen
 *   date="2026-11-15"
 *   charges={byDay.get('2026-11-15') ?? []}
 *   trials={trials.get('2026-11-15') ?? []}
 *   subsById={subsById}
 *   currency="USD"
 *   rates={rates}
 *   onClose={close}
 *   onOpenSub={openForm}
 *   onAddSub={addOnDay}
 * />
 * // "Domingo 15 de noviembre" / "3 cobros" / Netflix, Spotify, ChatGPT
 */
const DaySheet = ({
  isOpen,
  date,
  charges,
  trials,
  subsById,
  currency,
  rates,
  onClose,
  onOpenSub,
  onAddSub,
}: Props) => {
  // On a trial's last day its charge row already says "Fin de prueba: primer cobro"
  const runningTrials = trials.filter((sub) => sub.trial?.endDate !== date)
  const isEmpty = charges.length === 0 && runningTrials.length === 0
  // Paused charges don't count (nothing is paid); one charge is its own total
  const dayTotal = chargesTotal(charges, currency, rates)
  const dayNote = ratesNote(dayTotal.converted, dayTotal.unconverted, rates, todayISO())

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={date ? dayAndMonth(date) : undefined}
      subtitle={daySummary(charges.length, runningTrials.length)}
      footer={
        date && (
          <Button width="full" onClick={() => onAddSub(date)}>
            Agregar una subscripción
          </Button>
        )
      }
    >
      {isEmpty ? (
        <Typography variant="body" size="sm" className={emptyText}>
          Nada se cobra este día.
        </Typography>
      ) : (
        <div className={list}>
          {runningTrials.map((sub) => (
            <DayRow
              key={`trial-${sub.id}`}
              sub={sub}
              onOpen={() => onOpenSub(sub.id)}
              subLine={
                <Typography variant="label" size="sm" className={trialLine}>
                  {`Prueba gratis hasta el ${formatDayMonth(sub.trial?.endDate ?? '')}`}
                </Typography>
              }
            />
          ))}

          {charges.map((charge) => {
            const sub = subsById.get(charge.subscriptionId)
            if (!sub) return null
            // Paused first: a paused charge says so even on a trial's last day
            const subLine = charge.isPaused
              ? 'Pausada'
              : charge.isTrialEnd
                ? 'Fin de prueba: primer cobro'
                : formatBillingCycle(sub.billingCycle)
            return (
              <DayRow
                key={charge.subscriptionId}
                sub={sub}
                onOpen={() => onOpenSub(charge.subscriptionId)}
                price={chargeInCurrency(charge, currency, rates)}
                isPaused={charge.isPaused}
                subLine={
                  <Typography variant="label" size="sm" className={mutedLine}>
                    {subLine}
                  </Typography>
                }
              />
            )
          })}

          {dayTotal.count >= 2 && (
            <>
              <div className={total}>
                <Typography variant="label" size="md">
                  Total del día
                </Typography>
                <Typography
                  variant="currency"
                  size="lg"
                  currencySymbol={getCurrencySymbol(currency)}
                >
                  {dayTotal.total}
                </Typography>
              </div>
              {dayNote && (
                <Typography variant="label" size="sm" className={totalNote}>
                  {dayNote}
                </Typography>
              )}
            </>
          )}
        </div>
      )}
    </BottomSheet>
  )
}

export default DaySheet
