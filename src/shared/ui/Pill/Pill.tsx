import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

import styles from './Pill.module.scss'

interface PillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  className?: string
  isActive?: boolean
}

const Pill = ({ children, className = '', isActive, ...rest }: PillProps) => {
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
