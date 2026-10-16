// TYPES
import type { ReactNode } from 'react'
import type { ButtonProps } from '../Button/Button'

// UTILS
import { cn } from '@/shared/lib/cn'

// COMPONENTS
import Button from '../Button/Button'

// ASSETS
import styles from './IconButton.module.scss'

interface Props extends Omit<ButtonProps, 'aria-label' | 'children'> {
  /**
   * What the button does, read by screen readers (e.g. "Volver", "Eliminar subscripción").
   * Required: an icon has no text, so without it the button is announced as just "botón".
   */
  label: string
  /** The icon, e.g. `<IconArrow />`. */
  children: ReactNode
}

/**
 * A `Button` that only shows an icon: a square, elevated, 1.25rem icon (header style).
 * Defaults to `secondary`, `small` and `fit`. A `className` is added on top of the
 * base look, for the few places that need to adjust it.
 *
 * @example
 * <IconButton label="Volver" onClick={popOverlay}>
 *   <IconArrow />
 * </IconButton>
 */
const IconButton = ({
  label,
  variant = 'secondary',
  size = 'small',
  width = 'fit',
  className,
  children,
  ...rest
}: Props) => {
  const { button } = styles
  return (
    <Button
      {...rest}
      variant={variant}
      size={size}
      width={width}
      aria-label={label}
      className={cn(button, className)}
    >
      {children}
    </Button>
  )
}

export default IconButton
