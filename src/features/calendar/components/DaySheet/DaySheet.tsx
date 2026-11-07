// UTILS
import { countText } from '@/features/calendar/utils/countText'
import { dayAndMonth } from '@/shared/lib/calendar'
import { formatBillingCycle } from '@/features/subscriptions/utils/billingCycle'
import { formatAmount, getCurrencySymbol } from '@/shared/lib/currencies'
import { convert, type ExchangeRates } from '@/shared/lib/exchangeRates'

// TYPES
import type { Charge } from '@/features/subscriptions/utils/subscriptionHistory'
import type { ChargesTotal } from '@/features/calendar/utils/chargesTotal'
import type { CurrencyCode, Subscription } from '@/shared/types'

// COMPONENTS
import BottomSheet from '@/shared/ui/BottomSheet/BottomSheet'
import Button from '@/shared/ui/Button/Button'
import SubscriptionRow from '@/features/subscriptions/components/SubscriptionRow/SubscriptionRow'
import Typography from '@/shared/ui/Typography/Typography'

// ASSETS
import styles from './DaySheet.module.scss'

interface Props {
  /** Shows the sheet. */
  isOpen: boolean
  /** `YYYY-MM-DD`, the tapped day. `null` while no day is open. */
  date: string | null
  /** That day's charges, from `chargesByDay`. */
  charges: Charge[]
  /** Backdrop, Escape, back button or dragging it down. The page clears the date. */
  onClose: () => void
  /** Every subscription by id: a charge only carries its `subscriptionId`. */
  subsById: Map<string, Subscription>
  /** A row was tapped: the page closes the sheet and opens that subscription's form. */
  onOpenSub: (subscriptionId: string) => void
  /** "Agregar una subscripción" on an empty day: the page opens the preset picker with this date. */
  onAddSub: (date: string) => void
  /** The day's charges added up in `currency` (`chargesTotal`). Shown with 2+ paying charges. */
  dayTotal: ChargesTotal
  /** The currency picked at the top: the rows and the day total show it. */
  currency: CurrencyCode
  /** To convert each charge into `currency`. */
  rates: ExchangeRates | null
}

/**
 * The tapped day's sheet in the Calendario: the date as its title, how many charges it has,
 * and one row per charge (`SubscriptionRow`, the same look as Home's cards). Each row shows
 * that charge's own price (a yearly sub its whole year, not a monthly share) in the picked
 * currency, with the original under it when it was converted, and says
 * "Pausada", "Fin de prueba: primer cobro" or the cycle. Tapping a row opens that
 * subscription to edit it. An empty day says so and offers to add a subscription starting
 * on it. With 2 or more paying charges, "Total del día" adds them up in the selected
 * currency.
 *
 * @example
 * <DaySheet
 *   isOpen
 *   date="2026-11-15"
 *   charges={byDay.get('2026-11-15') ?? []}
 *   subsById={subsById}
 *   onClose={close}
 *   onOpenSub={openForm}
 * />
 * // "Domingo 15 de noviembre" / "3 cobros" / Netflix, Spotify, ChatGPT
 */
const DaySheet = ({
  isOpen,
  date,
  charges,
  onClose,
  subsById,
  onOpenSub,
  onAddSub,
  dayTotal,
  currency,
  rates,
}: Props) => {
  const { container, subscriptionList, rowButton, sublineClass, total, totalNote } =
    styles
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={date ? dayAndMonth(date) : undefined}
      subtitle={countText(charges.length)}
      footer={
        date &&
        charges.length === 0 && (
          <Button width="full" onClick={() => onAddSub(date)}>
            Agregar una subscripción
          </Button>
        )
      }
    >
      {date &&
        (charges.length === 0 ? (
          <div className={container}>
            <Typography variant="body" size="sm">
              Nada se cobra este día.
            </Typography>
          </div>
        ) : (
          <div className={subscriptionList}>
            {charges.map((charge) => {
              const sub = subsById.get(charge.subscriptionId)
              if (!sub) return null
              // Paused first: a paused charge says so even on a trial's last day
              const subLine = charge.isPaused
                ? 'Pausada'
                : charge.isTrialEnd
                  ? 'Fin de prueba: primer cobro'
                  : formatBillingCycle(sub.billingCycle)
              // In the picked currency, like Home's cards and the totals; what is really
              // charged goes in the small line. No rate: the charge's own currency, as is
              const converted = convert(charge.price, charge.currency, currency, rates)
              const isConverted = converted !== null && charge.currency !== currency
              return (
                <Button
                  key={charge.subscriptionId}
                  variant="secondary"
                  width="full"
                  onClick={() => onOpenSub(charge.subscriptionId)}
                  className={rowButton}
                >
                  <SubscriptionRow
                    icon={sub.icon}
                    name={sub.name}
                    subLine={
                      <Typography variant="label" size="sm" className={sublineClass}>
                        {subLine}
                      </Typography>
                    }
                    amount={converted ?? charge.price}
                    currencySymbol={getCurrencySymbol(
                      converted === null ? charge.currency : currency,
                    )}
                    priceNote={
                      isConverted
                        ? `${getCurrencySymbol(charge.currency)} ${formatAmount(charge.price)}`
                        : undefined
                    }
                    isPaused={charge.isPaused}
                  />
                </Button>
              )
            })}
            {/* One charge is its own total; paused ones don't count (nothing is paid) */}
            {dayTotal.count >= 2 && (
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
            )}
            {dayTotal.count >= 2 && dayTotal.unconverted > 0 && (
              <Typography variant="label" size="sm" className={totalNote}>
                {`${dayTotal.unconverted} sin sumar: faltan tasas de cambio`}
              </Typography>
            )}
          </div>
        ))}
    </BottomSheet>
  )
}

export default DaySheet
