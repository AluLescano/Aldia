import { useState } from 'react'

// HOOKS
import { useSettingsStore } from '@/features/settings/store'

// COMPONENTS
import Typography from '@/shared/ui/Typography/Typography'
import Label from '@/shared/ui/Label/Label'
import BottomSheet from '@/shared/ui/BottomSheet/BottomSheet'
import CurrencyPicker from '@/features/settings/components/CurrencyPicker'

// ASSETS
import { DEFAULT_CURRENCIES } from '@/shared/lib/currencies'

import styles from './MonthlyExpenses.module.scss'

interface Props {
  title?: string
  monthlyAmount?: string
  subscriptionAmount?: number
}

const MonthlyExpenses = ({
  title = 'Gastos Mensuales',
  monthlyAmount = '0,00',
  subscriptionAmount = 0,
}: Props) => {
  const { container, currencyPill } = styles
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const { selectedCurrency, setSelectedCurrency } = useSettingsStore()

  // Find the countryCode for the active currency (defaults to 'us')
  const currentCountryCode =
    DEFAULT_CURRENCIES.find((c) => c.code === selectedCurrency)?.countryCode ?? 'us'

  const subAmount = `${String(subscriptionAmount)} subscripciones activas`

  return (
    <>
      <div className={`${container} p-6`}>
        <div className="flex items-center justify-between">
          <Typography variant="overline">{title}</Typography>
          <Label
            size="small"
            onClick={() => setIsSheetOpen(true)}
            className={currencyPill}
          >
            <span className="flex items-center gap-1.5">
              <span
                className={`fi fi-${currentCountryCode} fi text-xs rounded-full inline-block`}
              />
              <span>{selectedCurrency}</span>
            </span>
          </Label>
        </div>

        <div className="mt-2 flex flex-col gap-1">
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
