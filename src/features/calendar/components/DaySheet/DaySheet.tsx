// UTILS
import { dayAndMonth } from '@/shared/lib/calendar'
import { formatBillingCycle } from '@/features/subscriptions/utils/billingCycle'
import { getCurrencySymbol } from '@/shared/lib/currencies'

// TYPES
import type { Charge } from '@/features/subscriptions/utils/subscriptionHistory'
import type { Subscription } from '@/shared/types'

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
}

// "Sin cobros", "1 cobro", "3 cobros"
const countText = (count: number) =>
  count === 0 ? 'Sin cobros' : `${count} ${count === 1 ? 'cobro' : 'cobros'}`

/**
 * The tapped day's sheet in the Calendario: the date as its title, how many charges it has,
 * and one row per charge (`SubscriptionRow`, the same look as Home's cards). Each row shows
 * that charge's own price (a yearly sub its whole year, not a monthly share) and says
 * "Pausada", "Fin de prueba: primer cobro" or the cycle. Tapping a row opens that
 * subscription to edit it. An empty day says so and offers to add a subscription starting
 * on it.
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
}: Props) => {
  const { container, subscriptionList, rowButton, sublineClass } = styles
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
                    amount={charge.price}
                    currencySymbol={getCurrencySymbol(charge.currency)}
                    isPaused={charge.isPaused}
                  />
                </Button>
              )
            })}
          </div>
        ))}
    </BottomSheet>
  )
}

export default DaySheet
