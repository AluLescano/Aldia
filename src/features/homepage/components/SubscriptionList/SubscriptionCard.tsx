// DEPENDENCIES
import { motion, useAnimation } from 'motion/react'
import type { CSSProperties } from 'react'

// HOOKS
import { formatDate } from '@/shared/lib/formatDate'

// COMPONENTS
import Typography from '@/shared/ui/Typography/Typography'
import Button from '@/shared/ui/Button/Button'

// TYPES
import type { Subscription } from '@/shared/types'

// ASSETS
import { IconDelete } from '@/assets/icons/IconDelete'

import styles from './SubscriptionList.module.scss'

interface Props {
  subscription: Subscription
  onDelete: (arg0: Subscription) => void
}

const SubscriptionCard = ({ subscription, onDelete }: Props) => {
  const {
    subscriptionContainer,
    disabled,
    cardWrapper,
    deleteLayer,
    deleteButton,
    deleteIcon,
    cardImg,
    opacity50,
    cardInfo,
    cardPrice,
  } = styles

  const isDisabled = subscription.status == 'inactive'

  const handleDelete = () => {
    onDelete(subscription)
    console.log('Delete Triggered for', subscription.name)
  }

  const controls = useAnimation()

  return (
    <div className={cardWrapper}>
      {/* 1. BACKGROUND LAYER (The Delete Button) */}
      <div className={deleteLayer}>
        <Button
          variant="primary"
          size="large"
          width="fit"
          onClick={handleDelete}
          className={deleteButton}
          aria-label="Delete subscription"
        >
          <IconDelete className={deleteIcon} />
        </Button>
      </div>

      {/* 2. FOREGROUND LAYER (The Draggable Card) */}
      <motion.div
        drag="x"
        // This limits dragging exclusively to the left by 70px (width of the button approx)
        dragConstraints={{ left: -70, right: 0 }}
        // Elasticity makes it bounce back slightly when letting go or pulling too far
        dragElastic={0.1}
        animate={controls}
        onDragEnd={(_, info) => {
          // If dragged past half the button width, or swiped fast, snap open. Else snap closed.
          if (info.offset.x < -35 || info.velocity.x < -500) {
            controls.start({ x: -70 })
          } else {
            controls.start({ x: 0 })
          }
        }}
        className={`${subscriptionContainer} ${isDisabled ? disabled : ''}`}
      >
        <div style={{ '--image': `url("${subscription.iconUrl}")` } as CSSProperties}>
          <img
            src={subscription.iconUrl}
            className={`${cardImg} ${isDisabled ? opacity50 : ''}`}
          />
          <div className={cardInfo}>
            <Typography
              variant="label"
              size="medium"
              className={isDisabled ? opacity50 : ''}
            >
              {subscription.name}
            </Typography>
            {!isDisabled && (
              <Typography variant="label" size="small">
                {formatDate(subscription.nextBillDate)}
              </Typography>
            )}
          </div>
          <div className={cardPrice}>
            <Typography
              variant="currency"
              size="medium"
              className={isDisabled ? opacity50 : ''}
            >
              {subscription.price}
            </Typography>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default SubscriptionCard
