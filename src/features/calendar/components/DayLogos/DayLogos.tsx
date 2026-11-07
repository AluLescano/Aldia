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
  /** Every subscription by id: a charge only carries its `subscriptionId`. */
  subsById: Map<string, Subscription>
  /** The tile is a neighbour month's day: the logos fade with it. */
  isOutside?: boolean
}

/**
 * The logos on a calendar tile: up to 2 overlapping, then a "+N" badge on the top right
 * for the rest. A paused charge's logo goes grey. Draws nothing on a day with no charges.
 *
 * @example
 * <DayLogos charges={byDay.get(date) ?? []} subsById={subsById} />
 */
const DayLogos = ({ charges, subsById, isOutside }: Props) => {
  const { container, faded, stack, logo, paused } = styles
  if (charges.length === 0) return null

  // Paused charges are already last, so the 2 spots go to real charges first
  const shown = charges.slice(0, MAX_LOGOS)

  return (
    <div className={cn(container, isOutside && faded)} aria-hidden="true">
      <div className={stack}>
        {shown.map((charge) => {
          const sub = subsById.get(charge.subscriptionId)
          return (
            <Avatar
              key={charge.subscriptionId}
              {...iconSource(sub?.icon)}
              name={sub?.name ?? ''}
              className={cn(logo, charge.isPaused && paused)}
            />
          )
        })}
      </div>
    </div>
  )
}

export default DayLogos
