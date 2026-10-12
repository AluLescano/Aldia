// DEPENDENCIES
import type { ReactNode, Ref } from 'react'

// COMPONENTS
import Typography from '../Typography/Typography'

// ASSETS
import styles from './Field.module.scss'

type Size = 'large' | 'medium'
type Width = 'full' | 'fit'

const {
  base,
  sizeLarge,
  sizeMedium,
  widthFull,
  widthFit,
  floated,
  errorState,
  labelContainer,
  adornmentContainer,
  description,
  error,
  info,
} = styles

interface Props {
  id: string
  size?: Size
  width?: Width
  label?: string
  filled?: boolean
  subText?: string
  errorMessage?: string
  ref?: Ref<HTMLDivElement>
  startAdornment?: ReactNode
  children: ReactNode
  disabled?: boolean
  className?: string
}

const sizeClasses: Record<Size, string> = {
  large: sizeLarge,
  medium: sizeMedium,
}

const widthClasses: Record<Width, string> = {
  full: widthFull,
  fit: widthFit,
}

const Field = ({
  id,
  size = 'large',
  width = 'full',
  label,
  filled,
  subText,
  errorMessage,
  ref,
  startAdornment,
  children,
  disabled,
  className,
}: Props) => {
  // Only the large size floats its label; medium rows get theirs from FormRow
  const showLabel = Boolean(label) && size === 'large'

  // An error replaces the hint, never shows next to it
  const message = errorMessage || subText

  const classes = [
    base,
    sizeClasses[size],
    widthClasses[width],
    filled && floated,
    errorMessage && errorState,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div>
      <div ref={ref} aria-disabled={disabled || undefined} className={classes}>
        {showLabel && (
          <label htmlFor={id} className={labelContainer}>
            {label}
          </label>
        )}
        {startAdornment && <div className={adornmentContainer}>{startAdornment}</div>}
        {children}
      </div>
      {message && (
        <div id={`${id}-description`} className={description}>
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
