import { useState } from 'react'

// HOOKS
import { useSettingsStore } from '@/features/settings/store'

// COMPONENTS
import MonthlyExpensesSkeleton from './MonthylExpensesSkeleton'
import CurrencyPicker from '@/features/settings/components/CurrencyPicker'
import BottomSheet from '@/shared/ui/BottomSheet/BottomSheet'
import Typography from '@/shared/ui/Typography/Typography'
import Pill from '@/shared/ui/Pill/Pill'

// ASSETS
import { DEFAULT_CURRENCIES } from '@/shared/lib/currencies'
import styles from './MonthlyExpenses.module.scss'

interface Props {
  title?: string
  monthlyAmount?: string
  subscriptionAmount?: number
  isLoading?: boolean
}

const MonthlyExpenses = ({
  title = 'Gastos Mensuales',
  monthlyAmount = '0,00',
  subscriptionAmount = 0,
  isLoading
}: Props) => {
  const { container, currencyPill, header, flagWrapper, flag, amounts } = styles
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const { selectedCurrency, setSelectedCurrency } = useSettingsStore()

  // Find the countryCode for the active currency (defaults to 'us')
  const currentCountryCode =
    DEFAULT_CURRENCIES.find((c) => c.code === selectedCurrency)?.countryCode ?? 'us'

  const subAmount = `${String(subscriptionAmount)} subscripciones activas`

  if (isLoading) {
    return <MonthlyExpensesSkeleton/>
  }

  return (
    <>
      <div className={container}>
        <div className={header}>
          <Typography variant="overline">{title}</Typography>
          <Pill onClick={() => setIsSheetOpen(true)} className={currencyPill}>
            <span className={flagWrapper}>
              <span
                className={`fi fi-${currentCountryCode} fi ${flag}`}
              />
              <Typography variant="label" size="small">
                {selectedCurrency}
              </Typography>
            </span>
          </Pill>
        </div>

        <div className={amounts}>
          <Typography variant="currency" size="large">
            {monthlyAmount}
          </Typography>
          <Typography variant="body" size="medium">
            {subAmount}
          </Typography>
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
