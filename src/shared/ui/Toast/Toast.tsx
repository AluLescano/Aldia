// DEPENDENCIES
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion, type PanInfo } from 'motion/react'

// UTILS
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
  /** Usually a `Typography`; can hold a button too (the undo toast). */
  message: ReactNode
  /** Sets the icon and the progress bar color. Defaults to `info`. */
  type?: 'success' | 'alert' | 'info'
  /** `top` slides in from the side, `bottom` rises from below. */
  position?: 'top' | 'bottom'
  /** Milliseconds before it closes by itself. Defaults to 5000. */
  duration?: number
  /** Called by the close button and when the time runs out. */
  onDismiss: () => void
  className?: string
}

/**
 * A short message that closes by itself, with a bar showing the time left. Swipe it back
 * the way it came (right for `top`, down for `bottom`) to close it early. Touching
 * it (or hovering on desktop) pauses the countdown. Render it inside `AnimatePresence`
 * so it can animate out.
 */
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

  // Theme tokens, so the bar follows light and dark mode like the icon does
  const progressBarColor = {
    alert: 'var(--error-fill)',
    success: 'var(--success-fill)',
    info: 'var(--info-fill)',
  }[type]

  const positionData = {
    // Each toast can be swiped back the way it came: right for the top one, down for the
    // bottom one. Elastic 1 follows the finger that way; 0.05 barely moves the other way.
    top: {
      initial: { x: '120%', opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: '120%', opacity: 0 },
      className: positionTop,
      drag: 'x' as const,
      dragConstraints: { left: 0, right: 0 },
      dragElastic: { left: 0.05, right: 1 },
      isDismissSwipe: ({ offset, velocity }: PanInfo) =>
        offset.x > 80 || velocity.x > 500,
    },
    bottom: {
      initial: { y: 20, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: '100%', opacity: 0 },
      className: positionBottom,
      drag: 'y' as const,
      dragConstraints: { top: 0, bottom: 0 },
      dragElastic: { top: 0.05, bottom: 1 },
      isDismissSwipe: ({ offset, velocity }: PanInfo) =>
        offset.y > 40 || velocity.y > 500,
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
      drag={positionData.drag}
      dragConstraints={positionData.dragConstraints}
      dragElastic={positionData.dragElastic}
      onDragStart={() => setIsPaused(true)}
      // Far or fast enough: close (the exit keeps going that way). Otherwise it springs back
      onDragEnd={(_, info) =>
        positionData.isDismissSwipe(info) ? onDismiss() : setIsPaused(false)
      }
      className={cn(container, positionData.className, className)}
    >
      <div className={contentWrapper}>
        {icon}
        <>{message}</>
      </div>

      <div className={closeWrapper}>
        <Button onClick={onDismiss} className={closeButton} aria-label="Cerrar">
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
