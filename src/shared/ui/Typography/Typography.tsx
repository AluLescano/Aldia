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
  const sizeClasses = {
    large: 'text-xl',
    medium: 'text-base',
    small: 'text-xs',
  }

  switch (variant) {
    case 'title': {
      const sizeClasses = {
        large: 'text-2xl font-bold',
        medium: 'text-lg font-semibold',
        small: 'text-sm font-medium',
      }
      return <h1 className={`${sizeClasses[size]} ${className}`.trim()}>{children}</h1>
    }

    case 'body':
      return <p className={`${sizeClasses[size]} ${className}`.trim()}>{children}</p>

    case 'overline':
    case 'label':
      return (
        <span
          className={`${sizeClasses[size]} tracking-widest ${variant === 'overline' ? 'uppercase' : ''} ${className}`.trim()}
        >
          {children}
        </span>
      )

    case 'currency': {
      const sizeClasses = {
        large: 'text-3xl font-bold',
        medium: 'text-xl font-bold',
        small: 'text-base font-semibold',
      }
      const decimalSizes = {
        large: 'text-lg font-semibold',
        medium: 'text-base font-medium',
        small: 'text-sm font-normal',
      }

      // Automatically extract integer & decimal!
      const { integerPart, decimalPart } = splitCurrency(children)

      return (
        <div className={`inline-flex gap-0.5 ${className}`.trim()}>
          <span className={`${sizeClasses[size]}`}>{currencySymbol}</span>
          <span className={`${sizeClasses[size]}`}>{integerPart}</span>
          {decimalPart && <span className={`${decimalSizes[size]}`}>{decimalPart}</span>}
        </div>
      )
    }

    default:
      return <span className={className}>{children}</span>
  }
}

export default Typography
