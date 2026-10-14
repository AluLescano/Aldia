// TYPES
import type { Currency } from '@/shared/types'

// COMPONENTS
import Typography from '@/shared/ui/Typography/Typography'
import styles from './CurrencyPicker.module.scss'

interface CurrencyPickerProps {
  currencies: Currency[]
  selectedCode?: string
  onSelect?: (code: string) => void
  onReorder?: (newOrder: Currency[]) => void // Presence of this will trigger dnd-kit later
  className?: string
}

const CurrencyPicker = ({
  currencies,
  selectedCode,
  onSelect,
  className = '',
}: CurrencyPickerProps) => {
  const {
    list,
    button,
    selected,
    unselected,
    leftSection,
    flag,
    currencyInfo,
    mutedText,
    rightSection,
  } = styles

  return (
    <ul className={`${list} ${className}`}>
      {currencies.map((currency) => {
        const isSelected = currency.code === selectedCode

        return (
          <li key={currency.code}>
            <button
              type="button"
              onClick={() => onSelect?.(currency.code)}
              className={`${button} ${isSelected ? selected : unselected}`}
            >
              {/* Left: Flag + Code + Name */}
              <div className={leftSection}>
                <span
                  className={`fi fi-${currency.countryCode} fis ${flag}`}
                />
                <div className={currencyInfo}>
                  <Typography variant="label" size="medium">
                    {currency.code}
                  </Typography>
                  <Typography
                    variant="label"
                    size="small"
                    className={mutedText}
                  >
                    {currency.name}
                  </Typography>
                </div>
              </div>
              {/* Right: Symbol */}
              <div className={rightSection}>
                <Typography
                  variant="body"
                  size="medium"
                  className={mutedText}
                >
                  {currency.symbol}
                </Typography>
              </div>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

export default CurrencyPicker
