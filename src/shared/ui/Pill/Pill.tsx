// DEPENDENCIES
import type { ButtonHTMLAttributes, ReactNode } from 'react'

// UTILS
import { cn } from '@/shared/lib/cn'

// ASSETS
import styles from './Pill.module.scss'

interface PillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  className?: string
  /** Highlighted look, e.g. the selected filter tab. */
  isActive?: boolean
}

/** A small rounded button: filter tabs on Home, the currency pill. Never submits a form. */
const Pill = ({ children, className, isActive, ...rest }: PillProps) => {
  const { container, active } = styles
  return (
    <button
      {...rest}
      type="button"
      className={cn(container, isActive && active, className)}
    >
      {children}
    </button>
  )
}

export default Pill
