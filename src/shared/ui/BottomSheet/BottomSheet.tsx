// DEPENDENCIES
import { useEffect, useRef, useState, type ReactNode, type TouchEvent } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

// UTILS
import { cn } from '@/shared/lib/cn'

// COMPONENTS
import Typography from '@/shared/ui/Typography/Typography'
import BackdropFilter from '../BackdropFilter/BackdropFilter'

// ASSETS
import styles from './BottomSheet.module.scss'

const { container, collapsed, expanded, dragArea, dragHandle, content, footerContainer } =
  styles

interface PanelProps {
  /** Called by the backdrop, Escape, or dragging the handle down. The parent sets `isOpen` to false. */
  onClose: () => void
  /** Big title under the drag handle; also the dialog's accessible name. */
  title?: string
  /** The scrolling content. */
  children: ReactNode
  /** Fixed buttons under the content (they don't scroll with it). */
  footer?: ReactNode
  /** Extra classes on the sheet panel. */
  className?: string
}

interface BottomSheetProps extends PanelProps {
  /** Shows the sheet. Setting it to false slides it out, then unmounts it. */
  isOpen: boolean
}

// Mounts when the sheet opens and unmounts after the exit animation,
// so isExpanded starts at false every time without any effect
const Panel = ({ onClose, title, children, footer, className }: PanelProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const startYRef = useRef(0)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleTouchStart = (event: TouchEvent) => {
    startYRef.current = event.touches[0].clientY
  }

  const handleTouchEnd = (event: TouchEvent) => {
    const deltaY = event.changedTouches[0].clientY - startYRef.current
    const threshold = 50

    if (!isExpanded) {
      if (deltaY < -threshold) setIsExpanded(true)
      else if (deltaY > threshold) onClose()
    } else if (deltaY > threshold) {
      setIsExpanded(false)
    }
  }

  return (
    <>
      <BackdropFilter onClick={onClose} />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(container, isExpanded ? expanded : collapsed, className)}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ duration: reduceMotion ? 0 : 0.3, ease: [0.32, 0.72, 0, 1] }}
      >
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className={dragArea}
        >
          <div className={dragHandle} />
          {title && (
            <Typography variant="title" size="lg">
              {title}
            </Typography>
          )}
        </div>
        <div className={content}>{children}</div>
        {footer && <div className={footerContainer}>{footer}</div>}
      </motion.div>
    </>
  )
}

/**
 * A panel that slides up from the bottom over a dimmed backdrop. Drag the handle up
 * to expand it, down to collapse or close it. Rendered in `document.body` (a portal),
 * so it sits above everything; its state starts fresh every time it opens.
 *
 * @example
 * <BottomSheet isOpen={open} onClose={() => setOpen(false)} title="Tipo de moneda">
 *   <CurrencyPicker ... />
 * </BottomSheet>
 */
const BottomSheet = ({ isOpen, ...panelProps }: BottomSheetProps) =>
  createPortal(
    <AnimatePresence>{isOpen && <Panel key="sheet" {...panelProps} />}</AnimatePresence>,
    document.body,
  )

export default BottomSheet
