// DEPENDENCIES
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { motion } from 'motion/react'

// UTILS
import { cn } from '@/shared/lib/cn'

// ASSETS
import styles from './Pill.module.scss'

interface PillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  className?: string
  /** Highlighted look, e.g. the selected filter tab. */
  isActive?: boolean
  /**
   * Makes the active background slide between pills instead of jumping. Give every pill
   * of the same group the same id (e.g. `"homeFilter"`); only the active one draws it.
   */
  layoutId?: string
}

/** A small rounded button: filter tabs on Home, the currency pill. Never submits a form. */
const Pill = ({ children, className, isActive, layoutId, ...rest }: PillProps) => {
  const { container, active, sliding, highlight } = styles
  return (
    <button
      {...rest}
      type="button"
      className={cn(container, isActive && active, layoutId && sliding, className)}
    >
      {isActive && layoutId && (
        <motion.span
          layoutId={layoutId}
          className={highlight}
          transition={{ type: 'spring', stiffness: 500, damping: 38 }}
        />
      )}
      {children}
    </button>
  )
}

export default Pill
