import { useRef, useState, type ButtonHTMLAttributes } from 'react'

// ASSETS
import styles from './Button.module.scss'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  size?: 'large' | 'medium' | 'small'
  width?: 'full' | 'fit'
  className?: string
}

interface Ripple {
  id: number
  x: number
  y: number
}

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

  const buttonSizeClasses = {
    large: sizeLarge,
    medium: sizeMedium,
    small: sizeSmall,
  }

  const buttonWidthClasses = {
    full: widthFull,
    fit: widthFit,
  }

  const buttonVariants = {
    primary: ButtonPrimary,
    secondary: ButtonSecondary,
  }

  const [ripples, setRipples] = useState<Ripple[]>([])
  const rippleIdRef = useRef(0)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
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
      className={`${buttonSizeClasses[size]} ${buttonVariants[variant]} ${buttonWidthClasses[width]} ${base} ${className || ''}`.trim()}
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
