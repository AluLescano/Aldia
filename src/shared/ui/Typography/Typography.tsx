// UTILS
import { cn } from '@/shared/lib/cn'
import { formatAmount } from '@/shared/lib/currencies'

// ASSETS
import styles from './Typography.module.scss'

type Size = '2xl' | 'xl' | 'lg' | 'md' | 'sm' | 'xs'

interface TypographyProps {
  /** Step of the type scale: 2xl 32px, xl 24, lg 20, md 16, sm 14, xs 12. Defaults to `md`. */
  size?: Size
  /**
   * - `title`: an `<h1>`, weight 500.
   * - `body`: a `<p>`.
   * - `label`: a `<span>`.
   * - `overline`: an uppercase `<span>`, weight 500 with wide letter spacing.
   * - `currency`: an amount, symbol + integer + smaller raised decimals (Light at xl and 2xl).
   */
  variant: 'title' | 'body' | 'overline' | 'label' | 'currency'
  /** For `currency`, a number gets thousands dots ("15.130" + "69"). */
  children: string | number
  /** Only for `currency`. Defaults to `$`. */
  currencySymbol?: string
  className?: string
}

// Splits an amount for the currency style: numbers get thousands dots ("15.130" + "69"),
// strings are split as they come ("250.50" or "250,50")
const splitCurrency = (value: string | number) => {
  if (typeof value === 'number') {
    const [integerPart, decimalPart] = formatAmount(value).split(',')
    return { integerPart, decimalPart }
  }

  const str = String(value).trim()
  const match = str.match(/^(.*?)[.,](\d+)$/)

  if (match) {
    return { integerPart: match[1], decimalPart: match[2] }
  }

  return { integerPart: str, decimalPart: undefined }
}

// Decimals use a smaller step of the same scale (about 0.6 of the amount, never under 12px)
const decimalSizes: Record<Size, Size> = {
  '2xl': 'lg',
  xl: 'md',
  lg: 'sm',
  md: 'xs',
  sm: 'xs',
  xs: 'xs',
}

// Big amounts go Light; smaller ones stay Regular so they don't look faded
const isBigAmount: Record<Size, boolean> = {
  '2xl': true,
  xl: true,
  lg: false,
  md: false,
  sm: false,
  xs: false,
}

/**
 * All the app's text styles in one component, so sizes and weights stay consistent.
 *
 * @example
 * <Typography variant="body" size="sm">Hola</Typography>
 * <Typography variant="currency" size="xl" currencySymbol="U$S">{12.5}</Typography>
 */
const Typography = ({
  size = 'md',
  variant,
  children,
  currencySymbol = '$',
  className = '',
}: TypographyProps) => {
  const {
    font,
    xxl,
    xl,
    lg,
    md,
    sm,
    xs,
    title,
    overline,
    uppercase,
    light,
    currencyWrapper,
    srOnly,
  } = styles

  const sizeClasses = {
    '2xl': xxl,
    xl: xl,
    lg: lg,
    md: md,
    sm: sm,
    xs: xs,
  }

  switch (variant) {
    case 'title': {
      return <h1 className={cn(font, sizeClasses[size], title, className)}>{children}</h1>
    }

    case 'body':
      return <p className={cn(font, sizeClasses[size], className)}>{children}</p>

    case 'overline':
    case 'label':
      return (
        <span
          className={cn(
            font,
            sizeClasses[size],
            variant === 'overline' && cn(overline, uppercase),
            className,
          )}
        >
          {children}
        </span>
      )

    case 'currency': {
      // Automatically extract integer & decimal!
      const { integerPart, decimalPart } = splitCurrency(children)
      const amountClass = cn(font, sizeClasses[size], isBigAmount[size] && light)

      return (
        <div className={cn(currencyWrapper, className)}>
          <span className={amountClass}>{currencySymbol}</span>
          <span className={amountClass}>{integerPart}</span>
          {decimalPart && (
            <>
              {/* The comma is hidden on screen, but screen readers need it */}
              <span className={srOnly}>,</span>
              <span className={cn(font, sizeClasses[decimalSizes[size]])}>
                {decimalPart}
              </span>
            </>
          )}
        </div>
      )
    }

    default:
      return <span className={className}>{children}</span>
  }
}

export default Typography
