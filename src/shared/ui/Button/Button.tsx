// DEPENDENCIES
import { useRef, useState, type ButtonHTMLAttributes, type PointerEvent } from 'react'

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
  /** Extra classes on top of the variant, size and width. */
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
 * The app's button for actions ("Guardar", "Agregar"...), with a ripple on every press.
 * Defaults to `type="button"`, so it never submits a form by accident; pass
 * `type="submit"` for that. For icon-only buttons use `IconButton`; for the inside
 * of a form field use a plain `<button>` (the field owns that look).
 */
const Button = ({
  variant = 'primary',
  size = 'large',
  type = 'button',
  width = 'fit',
  onPointerDown,
  children,
  className,
  ...rest
}: ButtonProps) => {
  const [ripples, setRipples] = useState<Ripple[]>([])
  const rippleIdRef = useRef(0)

  // The ripple starts when the finger lands, not on click (when it lifts): a button that
  // opens another screen would otherwise ripple underneath it, where nobody sees it.
  // It removes itself when its animation ends.
  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const newRipple: Ripple = {
      id: rippleIdRef.current++,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
    setRipples((prev) => [...prev, newRipple])
    onPointerDown?.(event)
  }

  const removeRipple = (id: number) => {
    setRipples((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <button
      {...rest}
      type={type}
      onPointerDown={handlePointerDown}
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
