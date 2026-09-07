import type { ButtonHTMLAttributes, ReactNode } from 'react'

import styles from './Label.module.scss'

interface LabelProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  className?: string
}

const Label = ({ children, className = '', ...rest }: LabelProps) => {
  const { container } = styles
  return (
    <button
      {...rest}
      type="button"
      className={`${container} px-2.5 py-1 rounded-full ${className}`}
    >
      {children}
    </button>
  )
}

export default Label
