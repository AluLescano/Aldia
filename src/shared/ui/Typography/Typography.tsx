import styles from './Typography.module.scss'

interface TypographyProps {
  size?: 'large' | 'medium' | 'small'
  variant: 'title' | 'body' | 'overline' | 'label' | 'currency'
  children: string | number
  currencySymbol?: string // optional: defaults to '$'
  className?: string
}

// Helper to auto-detect decimals in "250.50" or "250,50" or 250.5
const splitCurrency = (value: string | number) => {
  if (typeof value === 'number') {
    const [integerPart, decimalPart] = value.toFixed(2).split('.')
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
      return <h1 className={`${font} ${titleSizeClasses[size]} ${className}`.trim()}>{children}</h1>
    }

    case 'body':
      return <p className={`${font} ${sizeClasses[size]} ${className}`.trim()}>{children}</p>

    case 'overline':
    case 'label':
      return (
        <span
          className={`${font} ${sizeClasses[size]} ${trackingWidest} ${variant === 'overline' ? uppercase : ''} ${className}`.trim()}
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
        <div className={`${currencyWrapper} ${className}`.trim()}>
          <span className={`${font} ${currencySizeClasses[size]}`}>{currencySymbol}</span>
          <span className={`${font} ${currencySizeClasses[size]}`}>{integerPart}</span>
          {decimalPart && <span className={`${font} ${currencyDecimalWrapper} ${decimalSizes[size]}`}>{decimalPart}</span>}
        </div>
      )
    }

    default:
      return <span className={className}>{children}</span>
  }
}

export default Typography
