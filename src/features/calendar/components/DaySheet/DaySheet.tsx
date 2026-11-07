// UTILS
import { dayAndMonth } from '@/shared/lib/calendar'

// TYPES
import type { Charge } from '@/features/subscriptions/utils/subscriptionHistory'

// COMPONENTS
import BottomSheet from '@/shared/ui/BottomSheet/BottomSheet'

interface Props {
  /** Shows the sheet. */
  isOpen: boolean
  /** `YYYY-MM-DD`, the tapped day. `null` while no day is open. */
  date: string | null
  /** That day's charges, from `chargesByDay`. */
  charges: Charge[]
  /** Backdrop, Escape, back button or dragging it down. The page clears the date. */
  onClose: () => void
}

// "Sin cobros", "1 cobro", "3 cobros"
const countText = (count: number) =>
  count === 0 ? 'Sin cobros' : `${count} ${count === 1 ? 'cobro' : 'cobros'}`

/**
 * The tapped day's sheet in the Calendario: the date as its title and how many charges
 * it has. The charge rows come next (C3.2).
 *
 * @example
 * <DaySheet isOpen date="2026-11-15" charges={byDay.get('2026-11-15') ?? []} onClose={close} />
 * // "Domingo 15 de noviembre" / "3 cobros"
 */
const DaySheet = ({ isOpen, date, charges, onClose }: Props) => (
  <BottomSheet
    isOpen={isOpen}
    onClose={onClose}
    title={date ? dayAndMonth(date) : undefined}
    subtitle={countText(charges.length)}
  >
    {/* The day's charges go here (C3.2) */}
    <div />
  </BottomSheet>
)

export default DaySheet
