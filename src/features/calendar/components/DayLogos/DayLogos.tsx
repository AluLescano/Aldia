// UTILS
import { cn } from '@/shared/lib/cn'
import { iconSource } from '@/features/subscriptions/utils/subscriptionIcon'

// TYPES
import type { Charge } from '@/features/subscriptions/utils/subscriptionHistory'
import type { Subscription } from '@/shared/types'

// COMPONENTS
import Avatar from '@/shared/ui/Avatar/Avatar'

// ASSETS
import styles from './DayLogos.module.scss'

/** A tile has room for 2 logos; the rest become "+N". */
export const MAX_LOGOS = 2

interface Props {
  /** The day's charges, paused ones last (as `chargesByDay` sorts them). */
  charges: Charge[]
  /** Free trials that start this day: their logos go first, so the tinted days have a face. */
  trialStarts?: Subscription[]
  /** Every subscription by id: a charge only carries its `subscriptionId`. */
  subsById: Map<string, Subscription>
  /** The tile is a neighbour month's day: the logos fade with it. */
  isOutside?: boolean
}

/**
 * The logos on a calendar tile: up to 2 overlapping (the "+N" badge for the rest is drawn by
 * MonthGrid). Trials starting that day come first, then the charges; a paused charge's logo
 * goes grey. Draws nothing on a day with neither.
 *
 * @example
 * <DayLogos charges={byDay.get(date) ?? []} subsById={subsById} />
 */
const DayLogos = ({ charges, trialStarts = [], subsById, isOutside }: Props) => {
  const { container, faded, stack, logo, paused } = styles

  // Trial starts first, then charges (paused ones are already last), so the 2 spots go to
  // what matters most
  const items = [
    ...trialStarts.map((sub) => ({ id: sub.id, sub, isPaused: false })),
    ...charges.map((charge) => ({
      id: charge.subscriptionId,
      sub: subsById.get(charge.subscriptionId),
      isPaused: charge.isPaused,
    })),
  ]
  if (items.length === 0) return null
  const shown = items.slice(0, MAX_LOGOS)

  return (
    <div className={cn(container, isOutside && faded)} aria-hidden="true">
      <div className={stack}>
        {shown.map(({ id, sub, isPaused }) => (
          <Avatar
            key={id}
            {...iconSource(sub?.icon)}
            name={sub?.name ?? ''}
            className={cn(logo, isPaused && paused)}
          />
        ))}
      </div>
    </div>
  )
}

export default DayLogos
