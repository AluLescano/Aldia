// DEPENDENCIES
import { AnimatePresence } from 'motion/react'

// STORES
import { useUIStore } from '@/shared/store/uiStore'
import { useRatesStore } from '@/shared/store/ratesStore'
import { useSubscriptionStore } from '@/features/subscriptions/store/subscriptionStore'
import { useSettingsStore } from '@/features/settings/store/settingsStore'

// UTILS
import { getMonthlyTotal } from '@/features/subscriptions/utils/monthlyTotal'
import { formatDate } from '@/shared/lib/formatDate'
import { todayISO } from '@/shared/lib/isoDate'

// COMPONENTS
import Typography from '@/shared/ui/Typography/Typography'
import Button from '@/shared/ui/Button/Button'
import Toast from '@/shared/ui/Toast/Toast'
import MonthlyExpenses from '@/features/homepage/components/MonthlyExpenses/MonthlyExpenses'
import SubscriptionList from '@/features/homepage/components/SubscriptionList/SubscriptionList'

// ASSETS
import { IconAdd } from '@/assets/icons/IconAdd'
import { IconUndo } from '@/assets/icons/IconUndo'

import styles from './HomePage.module.scss'

/** The main tab: monthly total, the subscription list, the undo toast and the add button. */
export const HomePage = () => {
  const {
    container,
    header,
    toastContent,
    undoButton,
    fabWrapper,
    fabContainer,
    fabButton,
  } = styles

  const subs = useSubscriptionStore((state) => state.subscriptions)
  const deleteSubscription = useSubscriptionStore((state) => state.deleteSubscription)
  const lastDeleted = useSubscriptionStore((state) => state.lastDeleted)
  const undoDelete = useSubscriptionStore((state) => state.undoDelete)
  const clearLastDeleted = useSubscriptionStore((state) => state.clearLastDeleted)
  const pushOverlay = useUIStore((state) => state.pushOverlay)
  const selectedCurrency = useSettingsStore((state) => state.selectedCurrency)
  const rates = useRatesStore((state) => state.rates)

  const activeCount = subs.filter((sub) => sub.status === 'active').length
  const { total, converted, unconverted } = getMonthlyTotal(subs, selectedCurrency, rates)

  // Honest numbers: say when part of the total is missing or uses old rates
  const totalNote =
    unconverted > 0
      ? `${unconverted} sin sumar: faltan tasas de cambio`
      : converted > 0 && rates && rates.date < todayISO()
        ? `Tasas del ${formatDate(rates.date)}`
        : undefined

  return (
    <div className={container}>
      <header className={header}>
        <MonthlyExpenses
          title="Gastos Mensuales"
          monthlyAmount={total}
          subscriptionAmount={activeCount}
          note={totalNote}
        />
      </header>

      <SubscriptionList
        subscriptions={subs}
        onDelete={(sub) => deleteSubscription(sub.id)}
      />
      <AnimatePresence>
        {lastDeleted && (
          <Toast
            position="bottom"
            type="success"
            onDismiss={clearLastDeleted}
            message={
              <div className={toastContent}>
                <Typography variant="body" size="medium">
                  {`Se eliminó ${lastDeleted.name} exitosamente`}
                </Typography>
                <Button onClick={undoDelete} className={undoButton} aria-label="Deshacer">
                  <IconUndo />
                </Button>
              </div>
            }
          />
        )}
      </AnimatePresence>
      <div className={fabWrapper}>
        <div className={fabContainer}>
          <Button
            variant="primary"
            size="large"
            aria-label="Agregar Subscripción"
            onClick={() => pushOverlay('preset-picker')}
            className={fabButton}
          >
            <IconAdd />
          </Button>
        </div>
      </div>
    </div>
  )
}
