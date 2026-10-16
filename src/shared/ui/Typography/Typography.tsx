import { cn } from '@/shared/lib/cn'
import { formatAmount } from '@/shared/lib/currencies'

import styles from './Typography.module.scss'

interface TypographyProps {
  size?: 'large' | 'medium' | 'small'
  variant: 'title' | 'body' | 'overline' | 'label' | 'currency'
  children: string | number
  currencySymbol?: string // optional: defaults to '$'
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
