// TYPES
import type { Currency } from '@/features/settings/types'

// COMPONENTS
import Typography from '@/shared/ui/Typography/Typography'

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
  return (
    <ul className={`flex flex-col gap-1.5 py-1 mx-1.5 ${className}`}>
      {currencies.map((currency) => {
        const isSelected = currency.code === selectedCode

        return (
          <li key={currency.code}>
            <button
              type="button"
              onClick={() => onSelect?.(currency.code)}
              className={`flex items-center justify-between w-full px-3.5 py-3 rounded-xl transition-colors text-left ${
                isSelected
                  ? 'bg-[var(--brand-subtle)] text-[var(--text-primary)]'
                  : 'hover:bg-[var(--overlay-hover)] text-[var(--text-primary)]'
              }`}
            >
              {/* Left: Flag + Code + Name */}
              <div className="flex items-center gap-4">
                <span
                  className={`fi fi-${currency.countryCode} fis text-3xl rounded-full inline-block`}
                />
                <div className="flex flex-col">
                  <Typography variant="body" size="medium">
                    {currency.code}
                  </Typography>
                  <Typography
                    variant="label"
                    size="small"
                    className="text-[var(--text-muted)]"
                  >
                    {currency.name}
                  </Typography>
                </div>
              </div>
              {/* Right: Symbol */}
              <div className="flex items-center gap-3">
                <Typography
                  variant="body"
                  size="medium"
                  className="text-[var(--text-muted)]"
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
