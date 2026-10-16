// DEPENDENCIES
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/shared/lib/cn'

// COMPONENTS
import Button from '../Button/Button'

// ASSETS
import { IconAlert } from '@/assets/icons/IconAlert'
import { IconInfo } from '@/assets/icons/IconInfo'
import { IconSuccess } from '@/assets/icons/IconSuccess'
import { IconClose } from '@/assets/icons/IconClose'

import styles from './Toast.module.scss'

interface Props {
  message: ReactNode
  type?: 'success' | 'alert' | 'info'
  position?: 'top' | 'bottom'
  duration?: number
  onDismiss: () => void
  className?: string
}

const Toast = ({
  message,
  type = 'info',
  position = 'top',
  duration = 5000,
  onDismiss,
  className = '',
}: Props) => {
  const {
    container,
    iconAlert,
    iconSuccess,
    iconInfo,
    positionTop,
    positionBottom,
    contentWrapper,
    closeWrapper,
    closeButton,
    progressBar,
  } = styles
  const icon = {
    alert: <IconAlert className={iconAlert} />,
    success: <IconSuccess className={iconSuccess} />,
    info: <IconInfo className={iconInfo} />,
  }[type]

  const progressBarColor = {
    alert: '#B23333',
    success: '#7BAA39',
    info: '#FFFFFFB3',
  }[type]

  const positionData = {
    top: {
      initial: { x: '120%', opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: '120%', opacity: 0 },
      className: positionTop,
    },
    bottom: {
      initial: { y: 20, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: 20, opacity: 0 },
      className: positionBottom,
    },
  }[position]

  const onDismissRef = useRef(onDismiss)
  useEffect(() => {
    onDismissRef.current = onDismiss
  }, [onDismiss])

  const [isPaused, setIsPaused] = useState(false)
  const remainingTimeRef = useRef(duration)
  const startTimeRef = useRef(0)
  const timerIdRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!isPaused) {
      // START TIMER
      startTimeRef.current = Date.now()
      timerIdRef.current = setTimeout(() => {
        onDismissRef.current()
        timerIdRef.current = null
      }, remainingTimeRef.current)
    } else {
      // PAUSE TIMER
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current)
        timerIdRef.current = null
        const elapsed = Date.now() - startTimeRef.current
        remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed)
      }
    }

    return () => {
      // Cleanup on unmount
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current)
      }
    }
  }, [isPaused])

  return (
    <motion.div
      initial={positionData.initial}
      animate={positionData.animate}
      exit={positionData.exit}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      className={cn(container, positionData.className, className)}
    >
      <div className={contentWrapper}>
        {icon}
        <>{message}</>
      </div>

      <div className={closeWrapper}>
        <Button onClick={onDismiss} className={closeButton} aria-label="Close">
          <IconClose />
        </Button>
      </div>

      {/* Status Timer bar at the absolute bottom edge */}
      <div
        className={progressBar}
        style={{
          backgroundColor: progressBarColor,
          animation: `shrink ${duration}ms linear forwards`,
          animationPlayState: isPaused ? 'paused' : 'running',
        }}
      />
    </motion.div>
  )
}

export default Toast
