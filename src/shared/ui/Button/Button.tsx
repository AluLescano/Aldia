import { useRef, useState, type ButtonHTMLAttributes } from 'react'

// ASSETS
import styles from './Button.module.scss'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  size?: 'large' | 'medium' | 'small'
  width?: 'full' | 'fit'
  className?: string
}

const { ButtonPrimary, ButtonSecondary } = styles

const BUTTON_SIZE_CLASSES = {
  large: 'min-h-[3rem] py-3 px-6',
  medium: 'min-h-[2.5rem] py-2 px-4',
  small: 'min-h-[2rem] py-1 px-3',
} as const

const BUTTON_VARIANTS = {
  primary: ButtonPrimary,
  secondary: ButtonSecondary,
} as const

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
    setRipples((prev) => prev.filter((ripple) => ripple.id !== id))
  }

  return (
    <button
      {...rest}
      type={type}
      onClick={handleClick}
      className={`${BUTTON_SIZE_CLASSES[size]} ${BUTTON_VARIANTS[variant]} ${width === 'full' ? 'w-full' : 'w-fit'} rounded-xl ${className}`}
    >
      {children}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className={styles.ripple}
          style={{ left: ripple.x, top: ripple.y }}
          onAnimationEnd={() => removeRipple(ripple.id)}
        />
      ))}
    </button>
  )
}

export default Button
