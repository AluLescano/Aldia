// DEPENDENCIES
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type TouchEvent,
} from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

// HOOKS
import { useBackHandler } from '@/shared/hooks/useBackHandler'

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
  /** A smaller line right under the title, above the divider (e.g. the day sheet's "3 cobros"). */
  subtitle?: string
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

// A collapsed sheet is as tall as its content, up to this share of the screen
const COLLAPSED_MAX = 0.55

// One soft curve for every size change: quick to start, long gentle landing
const EASE = [0.22, 1, 0.36, 1] as const

// Mounts when the sheet opens and unmounts after the exit animation,
// so isExpanded starts at false every time without any effect
const Panel = ({ onClose, title, subtitle, children, footer, className }: PanelProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const startYRef = useRef(0)
  const reduceMotion = useReducedMotion()

  // The heights are measured in pixels: CSS can't animate to `auto` or under a `max-height`
  // that switches with a class, so both made the sheet jump instead of sliding
  const panelRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [naturalHeight, setNaturalHeight] = useState<number | null>(null)
  const [screenHeight, setScreenHeight] = useState(() => window.innerHeight)

  useLayoutEffect(() => {
    const panel = panelRef.current
    const contentBox = contentRef.current
    const inner = innerRef.current
    if (!panel || !contentBox || !inner) return

    // The whole sheet with nothing cut: everything around the content (handle, title,
    // footer, paddings) plus the content at its full height
    const measure = () => {
      const { paddingTop, paddingBottom } = getComputedStyle(contentBox)
      const chrome = panel.offsetHeight - contentBox.clientHeight
      const contentHeight =
        inner.offsetHeight + parseFloat(paddingTop) + parseFloat(paddingBottom)
      setNaturalHeight(chrome + contentHeight)
    }
    const onResize = () => {
      setScreenHeight(window.innerHeight)
      measure()
    }

    measure() // before the first paint, so the sheet never shows at a wrong size
    const observer = new ResizeObserver(measure) // rows added or removed later
    observer.observe(inner)
    window.addEventListener('resize', onResize)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', onResize)
    }
  }, [])

  const collapsedHeight =
    naturalHeight === null
      ? undefined
      : Math.min(naturalHeight, screenHeight * COLLAPSED_MAX)
  const sizeTransition = { duration: reduceMotion ? 0 : 0.5, ease: EASE }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  useBackHandler(onClose, true)

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
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(container, isExpanded ? expanded : collapsed, className)}
        // Until it's measured (the very first render), CSS keeps it under 55%
        style={
          naturalHeight === null ? { maxHeight: `${COLLAPSED_MAX * 100}vh` } : undefined
        }
        initial={{ y: '100%' }}
        animate={{ y: 0, height: isExpanded ? screenHeight : collapsedHeight }}
        exit={{
          y: '100%',
          transition: { duration: reduceMotion ? 0 : 0.35, ease: EASE },
        }}
        transition={{
          y: { duration: reduceMotion ? 0 : 0.4, ease: EASE },
          height: sizeTransition,
        }}
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
          {subtitle && (
            <Typography variant="label" size="sm">
              {subtitle}
            </Typography>
          )}
        </div>
        <div ref={contentRef} className={content}>
          {/* Measured: its height is the content's real height, even while it's cut */}
          <div ref={innerRef}>{children}</div>
        </div>
        {footer && <div className={footerContainer}>{footer}</div>}
      </motion.div>
    </>
  )
}

/**
 * A panel that slides up from the bottom over a dimmed backdrop. It's as tall as its
 * content, up to 55% of the screen (past that, the content scrolls). Drag the handle up
 * to expand it to the whole screen, down to collapse or close it; every move uses the same
 * soft curve. Rendered in `document.body` (a portal), so it sits above everything; its
 * state starts fresh every time it opens.
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
