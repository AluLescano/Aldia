// HOOKS
import { useState, useRef } from 'react'
import { FastAverageColor } from 'fast-average-color'

// COMPONENTS
import Typography from '@/shared/ui/Typography/Typography'

// TYPES
import type { Subscription } from '@/shared/types'

// ASSETS
import styles from './SubscriptionList.module.scss'

interface Props {
  subscription: Subscription
}

const SubscriptionCard = ({ subscription }: Props) => {
  const { subscriptionContainer, disabled } = styles
  const [dynamicColor, setDynamicColor] = useState<string | undefined>(
    subscription.brandColor,
  )
  const imgRef = useRef<HTMLImageElement>(null)

  const isDisabled = subscription.status == 'cancelled' || subscription.status == 'paused'

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

  return (
    <div
      className={`flex w-full h-fit items-center rounded-2xl p-3 ${subscriptionContainer} ${isDisabled ? disabled : ''}`}
      style={ !isDisabled ?
        (dynamicColor
          ? ({ '--accent-color': dynamicColor } as React.CSSProperties)
          : undefined) : undefined
      }
    >
      <img
        ref={imgRef}
        className={`w-10 h-10 rounded-full mr-3 shrink-0 ${isDisabled ? `opacity-50` : ``}`}
        src={subscription.iconUrl}
        crossOrigin="anonymous"
        onLoad={handleImageLoad}
      />
      <div className={`flex flex-col w-full min-w-0`}>
        <Typography variant="label" size="medium" className={`${isDisabled ? `opacity-50` : ``}`}>
          {subscription.name}
        </Typography>
        {!isDisabled && (
          <Typography variant="label" size="small">
            {/* 1. Format the date to DD Month (e.g. 01 Nov) */}
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
      {/* 2. Give this container a fixed width and keep text aligned to the left */}
      <div className="w-20 shrink-0 flex justify-start pl-2">
        <Typography
          variant="currency"
          size="medium"
          className={isDisabled ? `opacity-50` : ``}
        >
          {subscription.price}
        </Typography>
      </div>
    </div>
  )
}

export default SubscriptionCard
