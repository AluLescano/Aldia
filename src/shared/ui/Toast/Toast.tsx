// DEPENDENCIES
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion, type PanInfo } from 'motion/react'

// UTILS
import { cn } from '@/shared/lib/cn'

// COMPONENTS
import IconButton from '../IconButton/IconButton'

// TYPES
import type { ToastAction } from '@/shared/store/toastStore'

// ASSETS
import { IconAlert } from '@/assets/icons/IconAlert'
import { IconInfo } from '@/assets/icons/IconInfo'
import { IconSuccess } from '@/assets/icons/IconSuccess'
import { IconClose } from '@/assets/icons/IconClose'

import styles from './Toast.module.scss'

interface Props {
  /** Usually a `Typography`. */
  message: ReactNode
  /** Sets the icon and the progress bar color. Defaults to `info`. */
  type?: 'success' | 'alert' | 'info'
  /** Optional button next to the message, like "Deshacer". Runs its `onClick`, then closes. */
  action?: ToastAction
  /** Milliseconds before it closes by itself. Defaults to 5000. */
  duration?: number
  /** Called by the close button and when the time runs out. */
  onDismiss: () => void
  /** Extra classes on the toast. */
  className?: string
}

/**
 * A short message just above the nav bar that closes by itself, with a bar showing the
 * time left. Swipe it right to close it early. Touching it (or hovering on desktop)
 * pauses the countdown. Render it inside `AnimatePresence` so it can animate out.
 */
const Toast = ({
  message,
  type = 'info',
  action,
  duration = 5000,
  onDismiss,
  className = '',
}: Props) => {
  const {
    container,
    iconAlert,
    iconSuccess,
    iconInfo,
    position,
    actionButton,
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

  // Swipe right to close: elastic 1 follows the finger that way, 0.05 barely moves left
  const isDismissSwipe = ({ offset, velocity }: PanInfo) =>
    offset.x > 80 || velocity.x > 500

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
      initial={{ y: 20, opacity: 0 }}
      animate={{ x: 0, y: 0, opacity: 1 }}
      exit={{ x: '120%', opacity: 0 }} // leaves to the right, like the swipe
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={{ left: 0.05, right: 1 }}
      onDragStart={() => setIsPaused(true)}
      // Far or fast enough: close (the exit keeps going that way). Otherwise it springs back
      onDragEnd={(_, info) => (isDismissSwipe(info) ? onDismiss() : setIsPaused(false))}
      className={cn(container, position, className)}
    >
      <div className={contentWrapper}>
        {icon}
        <>{message}</>
      </div>

      <div className={closeWrapper}>
        {action && (
          <IconButton
            onClick={() => {
              action.onClick()
              onDismiss()
            }}
            className={actionButton}
            label={action.label}
          >
            {action.icon ?? action.label}
          </IconButton>
        )}
        <IconButton onClick={onDismiss} className={closeButton} label="Cerrar">
          <IconClose />
        </IconButton>
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
