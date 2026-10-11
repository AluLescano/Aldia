// DEPENDENCIES
import { motion, useAnimation } from 'motion/react'

// HOOKS
import { useState, useRef } from 'react'
import { FastAverageColor } from 'fast-average-color'

// COMPONENTS
import Typography from '@/shared/ui/Typography/Typography'

// TYPES
import type { Subscription } from '@/shared/types'

// ASSETS
import { IconDelete } from '@/assets/icons/IconDelete'
import styles from './SubscriptionList.module.scss'
import Button from '@/shared/ui/Button/Button'

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

  const [dynamicColor, setDynamicColor] = useState<string | undefined>(
    subscription.brandColor,
  )
  const imgRef = useRef<HTMLImageElement>(null)

  const isDisabled = subscription.status == 'inactive'

  const handleImageLoad = () => {
    try {
      if (imgRef.current) {
        const fac = new FastAverageColor()
        const color = fac.getColor(imgRef.current)
        if (color && color.hex) {
          setDynamicColor(color.hex)
        }
      }
    } catch (err) {
      console.warn('Failed to extract color', err)
    }
  }

  const handleDelete = () => {
    onDelete(subscription)
    console.log('Delete Triggered for', subscription.name)
  }

  const controls = useAnimation()

  return (
    <div className={cardWrapper}>
      {/* 1. BACKGROUND LAYER (The Delete Button) */}
      {/* Absolute positioned to fill the parent. It sits at z-index 0. */}
      <div className={deleteLayer}>
        <Button
          variant="primary"
          size="large"
          width="fit"
          onClick={handleDelete}
          className={deleteButton}
          aria-label="Delete subscription"
        >
          <IconDelete classname={deleteIcon} />
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
        style={
          !isDisabled
            ? dynamicColor
              ? ({ '--accent-color': dynamicColor } as React.CSSProperties)
              : undefined
            : undefined
        }
      >
        <img
          ref={imgRef}
          className={`${cardImg} ${isDisabled ? opacity50 : ''}`}
          src={subscription.iconUrl}
          crossOrigin="anonymous"
          onLoad={handleImageLoad}
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
              {(() => {
                const [year, month, day] = subscription.nextBillDate.split('-')
                const months = [
                  'Ene',
                  'Feb',
                  'Mar',
                  'Abr',
                  'May',
                  'Jun',
                  'Jul',
                  'Aug',
                  'Sep',
                  'Oct',
                  'Nov',
                  'Dic',
                ]
                return `${day} ${months[parseInt(month, 10) - 1]} ${year.substring(2, 4)}`
              })()}
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
      </motion.div>
    </div>
  )
}

export default SubscriptionCard
