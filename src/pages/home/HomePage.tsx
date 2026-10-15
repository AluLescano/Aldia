// DEPENDENCIES
import React, { useEffect } from 'react'

// STORAGE
import { useUIStore } from '@/shared/store/uiStore'
import { useSubscriptionStore } from '@/features/subscriptions/store/subscriptionStore'

// ANIMATIONS
import { AnimatePresence } from 'motion/react'

// COMPONENTS
import Typography from '@/shared/ui/Typography/Typography'
import Button from '@/shared/ui/Button/Button'
import Toast from '@/shared/ui/Toast/Toast'
import MonthlyExpenses from '@/features/homepage/components/MonthlyExpenses/MonthlyExpenses'
import SubscriptionList from '@/features/homepage/components/SubscriptionList/SubscriptionList'

// TYPES
import type { Subscription } from '@/shared/types'

// ASSETS
import { IconAdd } from '@/assets/icons/IconAdd'
import { IconUndo } from '@/assets/icons/IconUndo'

import styles from './HomePage.module.scss'


const MOCKED_SUBS: Subscription[] = [
  {
    id: 'claude-pro',
    name: 'Claude Pro',
    price: 20.0,
    currency: 'USD',
    billingCycle: { type: 'every', interval: 1, unit: 'month' },
    firstBillDate: '2026-10-02',
    nextBillDate: '2026-11-01',
    categoryId: 'ai',
    reminders: [],
    iconUrl: '/logos/logo_claude.webp',
    status: 'inactive',
    createdAt: '2026-10-02',
  },
  {
    id: 'midjourney',
    name: 'Midjourney',
    price: 10.0,
    currency: 'USD',
    billingCycle: { type: 'every', interval: 1, unit: 'month' },
    firstBillDate: '2026-10-05',
    nextBillDate: '2026-11-05',
    categoryId: 'ai',
    reminders: [],
    iconUrl: '/logos/logo_midjourney.webp',
    status: 'active',
    createdAt: '2026-10-02',
  },
  {
    id: 'spotify',
    name: 'Spotify',
    price: 3.98,
    currency: 'USD',
    billingCycle: { type: 'every', interval: 1, unit: 'month' },
    firstBillDate: '2026-09-28',
    nextBillDate: '2026-10-28',
    categoryId: 'entertainment',
    reminders: [],
    iconUrl: '/logos/logo_spotify.webp',
    status: 'active',
    createdAt: '2026-09-28',
  },
]

export const HomePage: React.FC = () => {
  const { container, header, toastContent, undoButton, fabWrapper, fabContainer, fabButton } = styles

  const subs = useSubscriptionStore((state) => state.subscriptions)
  const addSubscription = useSubscriptionStore((state) => state.addSubscription)
  const deleteSubscription = useSubscriptionStore((state) => state.deleteSubscription)
  const lastDeleted = useSubscriptionStore((state) => state.lastDeleted)
  const undoDelete = useSubscriptionStore((state) => state.undoDelete)
  const clearLastDeleted = useSubscriptionStore((state) => state.clearLastDeleted)
  const pushOverlay = useUIStore((state) => state.pushOverlay)

  useEffect(() => {
    if (useSubscriptionStore.getState().subscriptions.length === 0) {
      MOCKED_SUBS.forEach((sub) => {
        addSubscription(sub)
      })
    }
  }, [addSubscription])

  const ActiveSubsAmount = subs.filter((sub) => sub.status == 'active').length

  const MonthlyCost = () => {
    let sum = 0
    subs.forEach((sub) => {
      if (sub.status == 'active') {
        sum += sub.price
      }
    })
    return sum.toString()
  }

  return (
    <div className={container}>
      <header className={header}>
        <MonthlyExpenses
          title="Gastos Mensuales"
          monthlyAmount={MonthlyCost()}
          subscriptionAmount={ActiveSubsAmount}
        />
      </header>

      <SubscriptionList subscriptions={subs} onDelete={(sub) => deleteSubscription(sub.id)} />
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
                <Button
                  onClick={undoDelete}
                  className={undoButton}
                >
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
