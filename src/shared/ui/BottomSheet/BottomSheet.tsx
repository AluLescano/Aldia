import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

import Typography from '@/shared/ui/Typography/Typography'
import BackdropFilter from '../BackdropFilter/BackdropFilter'
import styles from './BottomSheet.module.scss'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
}

const BottomSheet = ({
  isOpen,
  onClose,
  title,
  children,
  className = '',
}: BottomSheetProps) => {
  const { container, collapsed, expanded, closing, dragArea, dragHandle, content } = styles

  // State
  const [isExpanded, setIsExpanded] = useState(false)
  const [shouldRender, setShouldRender] = useState(isOpen)
  const [isClosing, setIsClosing] = useState(false)
  const startYRef = useRef<number>(0)

  // Exit & entrance animation lifecycle
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
      setIsClosing(false)
    } else if (shouldRender) {
      setIsClosing(true)
      const timer = setTimeout(() => {
        setShouldRender(false)
        setIsClosing(false)
        setIsExpanded(false)
      }, 250) // 250ms matches the slideDown animation

      return () => clearTimeout(timer)
    }
  }, [isOpen, shouldRender])

  // Drag-to-expand / Drag-to-close handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    startYRef.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaY = e.changedTouches[0].clientY - startYRef.current
    const threshold = 50

    if (!isExpanded) {
      if (deltaY < -threshold) {
        setIsExpanded(true) // Dragged UP -> 100% full screen
      } else if (deltaY > threshold) {
        onClose() // Dragged DOWN -> Closes with exit animation
      }
    } else if (deltaY > threshold) {
      setIsExpanded(false) // Dragged DOWN while full screen -> Back to default height
    }
  }

  // Early return only after all hooks
  if (!shouldRender) return null

  return createPortal(
    <>
      <BackdropFilter onClick={onClose} />
      <div
        className={`${container} ${isExpanded ? expanded : collapsed} ${isClosing ? closing : ''} ${className}`}
      >
        {/* Drag handle & optional title */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className={dragArea}
        >
          <div className={dragHandle} />
          {title && (
            <Typography variant="title" size="large">
              {title}
            </Typography>
          )}
        </div>

        {/* Scrollable content */}
        <div className={content}>{children}</div>
      </div>
    </>,
    document.body,
  )
}

export default BottomSheet
