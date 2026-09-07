import type { ButtonHTMLAttributes } from 'react'

import Typography from '@/shared/ui/Typography/Typography'

import styles from './Label.module.scss'

interface LabelProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: string
  size?: 'medium' | 'small'
  className?: string
}

const Label = ({ children, size = 'medium', className = '', ...rest }: LabelProps) => {
  const { container } = styles
  return (
    <button
      {...rest}
      type="button"
      className={`${container} px-2.5 py-1 rounded-full ${className}`}
    >
      <Typography variant="label" size={size}>
        {children}
      </Typography>
    </button>
  )
}

export default Label
