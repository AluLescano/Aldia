// UTILS
import { cn } from '@/shared/lib/cn'

// COMPONENTS
import Typography from '@/shared/ui/Typography/Typography'

// TYPES
import type { Currency } from '@/shared/types'

// ASSETS
import styles from './CurrencyPicker.module.scss'

interface CurrencyPickerProps {
  /** The rows to show, in order (usually `DEFAULT_CURRENCIES`). */
  currencies: Currency[]
  /** The highlighted row. */
  selectedCode?: string
  onSelect?: (code: string) => void
  /** Planned: drag to reorder favorites in Settings. Not used yet. */
  onReorder?: (newOrder: Currency[]) => void
  className?: string
}

/** A list of currencies (flag, code, name, symbol) to pick one from, made for a bottom sheet. */
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
    <ul className={cn(list, className)}>
      {currencies.map((currency) => {
        const isSelected = currency.code === selectedCode

        return (
          <li key={currency.code}>
            <button
              type="button"
              onClick={() => onSelect?.(currency.code)}
              className={cn(button, isSelected ? selected : unselected)}
            >
              {/* Left: Flag + Code + Name */}
              <div className={leftSection}>
                <span className={cn(`fi fi-${currency.countryCode} fis`, flag)} />
                <div className={currencyInfo}>
                  <Typography variant="label" size="md">
                    {currency.code}
                  </Typography>
                  <Typography variant="label" size="sm" className={mutedText}>
                    {currency.name}
                  </Typography>
                </div>
              </div>
              {/* Right: Symbol */}
              <div className={rightSection}>
                <Typography variant="body" size="md" className={mutedText}>
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
