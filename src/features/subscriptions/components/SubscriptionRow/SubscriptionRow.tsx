// UTILS
import { cn } from '@/shared/lib/cn'
import { iconSource } from '../../utils/subscriptionIcon'

// TYPES
import type { CSSProperties, ReactNode } from 'react'
import type { SubscriptionIcon } from '@/shared/types'

// COMPONENTS
import Avatar from '@/shared/ui/Avatar/Avatar'
import Typography from '@/shared/ui/Typography/Typography'

// ASSETS
import styles from './SubscriptionRow.module.scss'

interface Props {
  /** Its logo or built-in icon; missing = the name's initial. */
  icon?: SubscriptionIcon
  name: string
  /** The line(s) under the name: each screen decides ("En 8 días", "Pausada", "Mensual"). */
  subLine?: ReactNode
  /** The price. Missing means free: the row says "Gratis" (a trial day). */
  amount?: number
  /** Goes with `amount`, e.g. "U$S". */
  currencySymbol?: string
  /** A small grey line under the price, e.g. what is really charged: "€ 240,00 al año". */
  priceNote?: string
  /** Logo, name and price at half opacity. */
  isPaused?: boolean
}

/**
 * How a subscription looks in a list: its logo with a soft glow of its colors behind,
 * the name with a line under it, and a price on the right. Only draws: Home's card wraps it
 * in its swipe, the Calendario's day sheet in a button, and each works out what it says.
 *
 * @example
 * <SubscriptionRow icon={sub.icon} name={sub.name} subLine="Mensual" amount={10} currencySymbol="U$S" />
 */
const SubscriptionRow = ({
  icon,
  name,
  subLine,
  amount,
  currencySymbol,
  priceNote,
  isPaused,
}: Props) => {
  const { row, logo, info, price, centered, note, faded, free } = styles
  const { src, iconKey } = iconSource(icon)

  return (
    // The glow's image; without a logo there's no glow (and no request for "undefined")
    <div
      className={row}
      style={src ? ({ '--image': `url("${src}")` } as CSSProperties) : undefined}
    >
      <Avatar
        src={src}
        iconKey={iconKey}
        name={name}
        className={cn(logo, isPaused && faded)}
      />
      <div className={info}>
        <Typography variant="label" size="md" className={isPaused ? faded : undefined}>
          {name}
        </Typography>
        {subLine}
      </div>
      <div className={cn(price, isPaused && faded, priceNote && centered)}>
        <Typography
          variant={amount !== undefined ? 'currency' : 'label'}
          size={amount !== undefined ? 'lg' : 'md'}
          currencySymbol={currencySymbol}
          className={amount === undefined ? free : undefined}
        >
          {amount ?? 'Gratis'}
        </Typography>
        {priceNote && (
          <Typography variant="label" size="sm" className={note}>
            {priceNote}
          </Typography>
        )}
      </div>
    </div>
  )
}

export default SubscriptionRow
