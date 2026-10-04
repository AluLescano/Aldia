// DEPENDENCIES
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion } from 'motion/react'

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
  const { container } = styles
  const icon = {
    alert: <IconAlert classname="w-5 h-5" />,
    success: <IconSuccess classname="w-5 h-5" />,
    info: <IconInfo classname="w-5 h-5" />,
  }[type]

  const progressBarColor = {
    alert: '#B23333',
    success: '#7BAA39',
    info: '#FFFFFFB3',
  }[type]

  const positionData = {
    top: { 
      initial: { y: -20, opacity: 0 }, 
      exit: { y: -20, opacity: 0 }, 
      className: 'fixed top-6 right-4'
    },
    bottom: { 
      initial: { y: 10, opacity: 0 }, 
      exit: { y: 10, opacity: 0 }, 
      className: 'fixed bottom-36 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[calc(448px-2rem)]' 
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
      animate={{ x: 0, y: 60, opacity: 1 }}
      exit={positionData.exit}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      className={`z-50 flex items-center justify-between py-3.5 px-4 ${container} rounded-xl shadow-2xl overflow-hidden ${positionData.className} ${className}`}
    >
      <div className="flex w-full items-center gap-3">
        {icon}
        <>
          {message}
        </>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={onDismiss} 
          className="p-1 text-zinc-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <IconClose classname="w-5 h-5" />
        </button>
      </div>

      {/* Status Timer bar at the absolute bottom edge */}
      <div
        className="absolute bottom-0 left-0 h-1 w-full"
        style={{ 
          backgroundColor: progressBarColor, 
          animation: `shrink ${duration}ms linear forwards`,
          animationPlayState: isPaused ? 'paused' : 'running'
        }}
      />
    </motion.div>
  )
}

export default Toast
