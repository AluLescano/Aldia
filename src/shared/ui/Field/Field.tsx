import type { ReactNode } from 'react'
import styles from './Field.module.scss'
import Typography from '../Typography/Typography'

interface Props {
  id: string
  size?: 'large' | 'medium'
  width?: 'full' | 'fit'
  label?: string
  filled?: boolean
  subText?: string
  errorMessage?: string
  children: ReactNode
  disabled?: boolean
  className?: string
}

const Field = ({
  id,
  size = 'medium',
  width = 'full',
  label,
  filled,
  subText,
  errorMessage,
  children,
  disabled,
  className,
}: Props) => {
  const {
    base,
    sizeLarge,
    sizeMedium,
    widthFull,
    widthFit,
    labelContainer,
    floated,
    error,
    errorState,
    info,
  } = styles

  const fieldSizeClasses = {
    large: sizeLarge,
    medium: sizeMedium,
  }

  const fieldWidthClasses = {
    full: widthFull,
    fit: widthFit,
  }

  // An error replaces the hint, never shows next to it
  const message = errorMessage || subText

  return (
    <div>
      <div
        aria-disabled={disabled || undefined}
        className={`${base} ${fieldSizeClasses[size]} ${fieldWidthClasses[width]} ${filled ? floated : ''} ${errorMessage ? errorState : ''} ${className || ''}`}
      >
        {label && (
          <label htmlFor={id} className={labelContainer}>
            {label}
          </label>
        )}
        {children}
      </div>
      {message && (
        <div id={`${id}-description`}>
          <Typography
            variant="label"
            size="small"
            className={errorMessage ? error : info}
          >
            {message}
          </Typography>
        </div>
      )}
    </div>
  )
}

export default Field
