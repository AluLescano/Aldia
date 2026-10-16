// DEPENDENCIES
import { useRef, useState, type ButtonHTMLAttributes, type MouseEvent } from 'react'

// UTILS
import { cn } from '@/shared/lib/cn'

// ASSETS
import styles from './Button.module.scss'

/** Everything a native `<button>` accepts, plus the look of the design system. */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** `primary`: filled brand color, for the main action. `secondary`: quieter. Defaults to `primary`. */
  variant?: 'primary' | 'secondary'
  /** Height and padding. Defaults to `large`. */
  size?: 'large' | 'medium' | 'small'
  /** `full` stretches to the container, `fit` hugs the content. Defaults to `fit`. */
  width?: 'full' | 'fit'
  className?: string
}

interface Ripple {
  id: number
  x: number
  y: number
}

const {
  ButtonPrimary,
  ButtonSecondary,
  sizeLarge,
  sizeMedium,
  sizeSmall,
  widthFull,
  widthFit,
  base,
  ripple,
} = styles

// Built once when the file loads, not on every render
const sizeClasses = { large: sizeLarge, medium: sizeMedium, small: sizeSmall }
const widthClasses = { full: widthFull, fit: widthFit }
const variantClasses = { primary: ButtonPrimary, secondary: ButtonSecondary }

/**
 * The app's button for actions ("Guardar", "Agregar"...), with a ripple on every tap.
 * Defaults to `type="button"`, so it never submits a form by accident; pass
 * `type="submit"` for that. For icon-only buttons use `IconButton`; for the inside
 * of a form field use a plain `<button>` (the field owns that look).
 */
const Button = ({
  variant = 'primary',
  size = 'large',
  type = 'button',
  width = 'fit',
  onClick,
  children,
  className,
  ...rest
}: ButtonProps) => {
  const [ripples, setRipples] = useState<Ripple[]>([])
  const rippleIdRef = useRef(0)

  // Each tap adds a ripple where the finger landed; it removes itself when its animation ends
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const newRipple: Ripple = {
      id: rippleIdRef.current++,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
    setRipples((prev) => [...prev, newRipple])
    onClick?.(event)
  }

  const removeRipple = (id: number) => {
    setRipples((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <button
      {...rest}
      type={type}
      onClick={handleClick}
      className={cn(
        sizeClasses[size],
        variantClasses[variant],
        widthClasses[width],
        base,
        className,
      )}
    >
      {children}
      {ripples.map((r) => (
        <span
          key={r.id}
          className={ripple}
          style={{ left: r.x, top: r.y }}
          onAnimationEnd={() => removeRipple(r.id)}
        />
      ))}
    </button>
  )
}

export default Button
