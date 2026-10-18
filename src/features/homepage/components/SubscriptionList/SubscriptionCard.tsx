// DEPENDENCIES
import { useRef, type CSSProperties } from 'react'
import { motion, useAnimation } from 'motion/react'

// STORES
import { useUIStore } from '@/shared/store/uiStore'
import { useRatesStore } from '@/shared/store/ratesStore'
import { useSettingsStore } from '@/features/settings/store/settingsStore'

// UTILS
import { cn } from '@/shared/lib/cn'
import { formatDate } from '@/shared/lib/formatDate'
import { todayISO } from '@/shared/lib/isoDate'
import { formatAmount, getCurrencySymbol } from '@/shared/lib/currencies'
import { convert } from '@/shared/lib/exchangeRates'
import { nextBillDate } from '@/features/subscriptions/utils/billingCycle'

// COMPONENTS
import Typography from '@/shared/ui/Typography/Typography'
import Button from '@/shared/ui/Button/Button'
import Avatar from '@/shared/ui/Avatar/Avatar'

// TYPES
import type { Subscription } from '@/shared/types'

// ASSETS
import { IconDelete } from '@/assets/icons/IconDelete'

import styles from './SubscriptionList.module.scss'

const {
  subscriptionContainer,
  disabled,
  cardWrapper,
  deleteLayer,
  deleteButton,
  deleteIcon,
  cardImg,
  centered,
  opacity50,
  cardInfo,
  cardPrice,
  originalPrice,
} = styles

// How far the card slides left to uncover the delete button (about the button's width)
const OPEN_X = -70

interface Props {
  /** Its logo, name, price and next charge are shown on the card. */
  subscription: Subscription
  /** Called from the delete button uncovered by swiping the card left. */
  onDelete: (subscription: Subscription) => void
}

/**
 * One subscription on Home. Tap to open its detail screen; swipe left to uncover
 * the delete button. A tap on a swiped-open card closes it instead of opening it.
 */
const SubscriptionCard = ({ subscription, onDelete }: Props) => {
  const pushOverlay = useUIStore((state) => state.pushOverlay)
  const selectedCurrency = useSettingsStore((state) => state.selectedCurrency)
  const rates = useRatesStore((state) => state.rates)
  const controls = useAnimation()

  // Memory between events, nothing to draw: refs, so changing them never re-renders.
  // The finger moved since it touched the card (then lifting it is not a tap)
  const wasDragged = useRef(false)
  // The card is slid open, showing the delete button
  const isOpen = useRef(false)

  const slideTo = (open: boolean) => {
    isOpen.current = open
    controls.start({ x: open ? OPEN_X : 0 })
  }

  const handleTap = () => {
    if (wasDragged.current) return
    if (isOpen.current) {
      slideTo(false)
      return
    }
    pushOverlay('subscription-form', { subscriptionId: subscription.id })
  }

  const isPaused = subscription.status === 'inactive'

  // Calculated, not read from the stored field, so it never shows a date that already passed
  const nextCharge = nextBillDate(
    subscription.firstBillDate,
    subscription.billingCycle,
    todayISO(),
  )

  // In another currency: show it converted to the one picked on Home, and keep the
  // original (what the card is really charged) small underneath. No rate: original only.
  const isForeign = subscription.currency !== selectedCurrency
  const converted = isForeign
    ? convert(subscription.price, subscription.currency, selectedCurrency, rates)
    : null
  const shownAmount = converted ?? subscription.price
  const shownSymbol = getCurrencySymbol(
    converted !== null ? selectedCurrency : subscription.currency,
  )

  return (
    <div className={cardWrapper}>
      {/* Background: the delete button, uncovered by the swipe */}
      <div className={deleteLayer}>
        <Button
          variant="primary"
          size="large"
          width="fit"
          onClick={() => onDelete(subscription)}
          className={deleteButton}
          aria-label={`Eliminar ${subscription.name}`}
        >
          <IconDelete className={deleteIcon} />
        </Button>
      </div>

      {/* Foreground: the card itself, draggable to the left only */}
      <motion.div
        drag="x"
        dragConstraints={{ left: OPEN_X, right: 0 }}
        dragElastic={0.1} // a small bounce past the limits
        animate={controls}
        onTapStart={() => {
          wasDragged.current = false // every touch starts as a possible tap
        }}
        onDragStart={() => {
          wasDragged.current = true
        }}
        onTap={handleTap}
        onDragEnd={(_, info) => {
          // Past half the button, or a fast swipe: snap open. Otherwise snap closed.
          slideTo(info.offset.x < OPEN_X / 2 || info.velocity.x < -500)
        }}
        className={cn(subscriptionContainer, isPaused && disabled)}
      >
        <div style={{ '--image': `url("${subscription.iconUrl}")` } as CSSProperties}>
          {subscription.iconUrl ? (
            <img
              src={subscription.iconUrl}
              alt="" // decorative: the name is right next to it
              className={cn(cardImg, isPaused && opacity50)}
            />
          ) : (
            <Avatar
              iconKey={subscription.iconKey}
              name={subscription.name}
              className={cn(cardImg, isPaused && opacity50)}
            />
          )}
          <div className={cardInfo}>
            <Typography
              variant="label"
              size="md"
              className={isPaused ? opacity50 : undefined}
            >
              {subscription.name}
            </Typography>
            {!isPaused && (
              <Typography variant="label" size="sm">
                {formatDate(nextCharge)}
              </Typography>
            )}
          </div>
          <div
            className={cn(
              cardPrice,
              isPaused && opacity50,
              converted !== null && centered,
            )}
          >
            <Typography variant="currency" size="lg" currencySymbol={shownSymbol}>
              {shownAmount}
            </Typography>
            {converted !== null && (
              <Typography variant="label" size="sm" className={originalPrice}>
                {`${getCurrencySymbol(subscription.currency)} ${formatAmount(subscription.price)}`}
              </Typography>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default SubscriptionCard
