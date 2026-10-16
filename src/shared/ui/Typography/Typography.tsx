// UTILS
import { cn } from '@/shared/lib/cn'
import { formatAmount } from '@/shared/lib/currencies'

// ASSETS
import styles from './Typography.module.scss'

interface TypographyProps {
  /** Defaults to `medium`. */
  size?: 'large' | 'medium' | 'small'
  /**
   * - `title`: an `<h1>`.
   * - `body`: a `<p>` (note: browser paragraph margins apply until the base cleanup).
   * - `label` / `overline`: a `<span>` with wide letter spacing (`overline` is uppercase).
   * - `currency`: an amount, symbol + integer + smaller raised decimals.
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

/**
 * All the app's text styles in one component, so sizes and weights stay consistent.
 *
 * @example
 * <Typography variant="body" size="small">Hola</Typography>
 * <Typography variant="currency" size="large" currencySymbol="U$S">{12.5}</Typography>
 */
const Typography = ({
  size = 'medium',
  variant,
  children,
  currencySymbol = '$',
  className = '',
}: TypographyProps) => {
  const {
    font,
    large,
    medium,
    small,
    titleLarge,
    titleMedium,
    titleSmall,
    trackingWidest,
    uppercase,
    currencyLarge,
    currencyMedium,
    currencySmall,
    currencyDecimalLarge,
    currencyDecimalMedium,
    currencyDecimalSmall,
    currencyWrapper,
    currencyDecimalWrapper,
  } = styles

  const sizeClasses = {
    large: large,
    medium: medium,
    small: small,
  }

  switch (variant) {
    case 'title': {
      const titleSizeClasses = {
        large: titleLarge,
        medium: titleMedium,
        small: titleSmall,
      }
      return <h1 className={cn(font, titleSizeClasses[size], className)}>{children}</h1>
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
            trackingWidest,
            variant === 'overline' && uppercase,
            className,
          )}
        >
          {children}
        </span>
      )

    case 'currency': {
      const currencySizeClasses = {
        large: currencyLarge,
        medium: currencyMedium,
        small: currencySmall,
      }
      const decimalSizes = {
        large: currencyDecimalLarge,
        medium: currencyDecimalMedium,
        small: currencyDecimalSmall,
      }

      // Automatically extract integer & decimal!
      const { integerPart, decimalPart } = splitCurrency(children)

      return (
        <div className={cn(currencyWrapper, className)}>
          <span className={cn(font, currencySizeClasses[size])}>{currencySymbol}</span>
          <span className={cn(font, currencySizeClasses[size])}>{integerPart}</span>
          {decimalPart && (
            <span className={cn(font, currencyDecimalWrapper, decimalSizes[size])}>
              {decimalPart}
            </span>
          )}
        </div>
      )
    }

    default:
      return <span className={className}>{children}</span>
  }
}

export default Typography
