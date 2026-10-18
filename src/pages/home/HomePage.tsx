// DEPENDENCIES
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'

// STORES
import { useUIStore } from '@/shared/store/uiStore'
import { useRatesStore } from '@/shared/store/ratesStore'
import { useSubscriptionStore } from '@/features/subscriptions/store/subscriptionStore'
import { useSettingsStore } from '@/features/settings/store/settingsStore'

// HOOKS
import { useDeleteSubscription } from '@/features/subscriptions/hooks/useDeleteSubscription'

// UTILS
import { getMonthlyTotal } from '@/features/subscriptions/utils/monthlyTotal'
import { formatDate } from '@/shared/lib/formatDate'
import { todayISO } from '@/shared/lib/isoDate'

// COMPONENTS
import Button from '@/shared/ui/Button/Button'
import MonthlyExpenses from '@/features/homepage/components/MonthlyExpenses/MonthlyExpenses'
import SubscriptionList from '@/features/homepage/components/SubscriptionList/SubscriptionList'

// ASSETS
import { IconAdd } from '@/assets/icons/IconAdd'

import styles from './HomePage.module.scss'

/** The main tab: monthly total, the subscription list and the add button. */
export const HomePage = () => {
  const { container, header, fabWrapper, fabContainer, fabButton } = styles

  const subs = useSubscriptionStore((state) => state.subscriptions)
  const deleteWithUndo = useDeleteSubscription() // the app toast offers "Deshacer"
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

      <SubscriptionList subscriptions={subs} onDelete={deleteWithUndo} />
      {/* Portaled out of the page: the page slide moves it with a transform, and a fixed
          element inside a transformed parent is placed against that parent, not the screen
          (it jumped 16px). Into #root, not <body>: #root is isolated, so only inside it does
          z-index 30 keep the FAB under the overlays and the toast.
          `propagate`: it still fades out when Home slides away */}
      {createPortal(
        <AnimatePresence propagate>
          <motion.div
            key="fab"
            className={fabWrapper}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
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
          </motion.div>
        </AnimatePresence>,
        document.getElementById('root') ?? document.body,
      )}
    </div>
  )
}
