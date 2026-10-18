// DEPENDENCIES
import { useState } from 'react'

// HOOKS
import { useCountUp } from '@/shared/hooks/useCountUp'

// STORES
import { useSettingsStore } from '@/features/settings/store/settingsStore'
import { useRatesStore } from '@/shared/store/ratesStore'

// UTILS
import { DEFAULT_CURRENCIES, getCurrencySymbol } from '@/shared/lib/currencies'

// COMPONENTS
import MonthlyExpensesSkeleton from './MonthlyExpensesSkeleton'
import CurrencyPicker from '@/shared/ui/CurrencyPicker/CurrencyPicker'
import BottomSheet from '@/shared/ui/BottomSheet/BottomSheet'
import Typography from '@/shared/ui/Typography/Typography'
import Pill from '@/shared/ui/Pill/Pill'

// ASSETS
import styles from './MonthlyExpenses.module.scss'

interface Props {
  title?: string
  /** Monthly cost, already converted to the selected currency. */
  monthlyAmount?: number
  /** How many subscriptions are active, for the line under the amount. */
  subscriptionAmount?: number
  /** Optional small line under the count, e.g. when rates are old or missing. */
  note?: string
  isLoading?: boolean
}

/**
 * The Home header: monthly total in the selected currency, the active count, and the
 * currency pill that opens a sheet to switch currency (saved in the settings store).
 */
const MonthlyExpenses = ({
  title = 'Gastos Mensuales',
  monthlyAmount = 0,
  subscriptionAmount = 0,
  note,
  isLoading,
}: Props) => {
  const { container, currencyPill, header, flagWrapper, flag, amounts, currencyRate } =
    styles
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const { selectedCurrency, setSelectedCurrency } = useSettingsStore()
  const ratesDate = useRatesStore((state) => state.rates?.date)

  // Rolls up or down when subscriptions change the total. Jumps instead when only the unit
  // changes (another currency, new rates) and while loading (no counting from 0 on open)
  const shownAmount = useCountUp(monthlyAmount, {
    instant: isLoading,
    jumpKey: `${selectedCurrency}|${ratesDate ?? ''}`,
  })

  // Find the countryCode for the active currency (defaults to 'us')
  const currentCountryCode =
    DEFAULT_CURRENCIES.find((c) => c.code === selectedCurrency)?.countryCode ?? 'us'

  const subAmount = `${String(subscriptionAmount)} subscripciones activas`

  if (isLoading) {
    return <MonthlyExpensesSkeleton />
  }

  return (
    <>
      <div className={container}>
        <div className={header}>
          <Typography variant="overline" size="sm">
            {title}
          </Typography>
          <Pill onClick={() => setIsSheetOpen(true)} className={currencyPill}>
            <span className={flagWrapper}>
              <span className={`fi fi-${currentCountryCode} fi ${flag}`} />
              <Typography variant="label" size="sm">
                {selectedCurrency}
              </Typography>
            </span>
          </Pill>
        </div>

        <div className={amounts}>
          <Typography
            variant="currency"
            size="2xl"
            currencySymbol={getCurrencySymbol(selectedCurrency)}
          >
            {shownAmount}
          </Typography>
          <Typography variant="body" size="sm">
            {subAmount}
          </Typography>
          {note && (
            <Typography variant="body" size="xs" className={currencyRate}>
              {note}
            </Typography>
          )}
        </div>
      </div>

      <BottomSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title="Seleccionar moneda"
      >
        <CurrencyPicker
          currencies={DEFAULT_CURRENCIES}
          selectedCode={selectedCurrency}
          onSelect={(code) => {
            setSelectedCurrency(code)
            setIsSheetOpen(false)
          }}
        />
      </BottomSheet>
    </>
  )
}

export default MonthlyExpenses
