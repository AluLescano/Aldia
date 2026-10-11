// DEPENDENCIES
import React, { useEffect, useState } from 'react'

// STORAGE
import { useUIStore } from '@/shared/store/uiStore'
import { useSubscriptionStore } from '@/features/subscriptions/store/subscriptionStore'

// COMPONENTS
import Button from '@/shared/ui/Button/Button'
import MonthlyExpenses from '@/features/homepage/components/MonthlyExpenses/MonthlyExpenses'
import SubscriptionList from '@/features/homepage/components/SubscriptionList/SubscriptionList'

// TYPES
import type { Subscription } from '@/shared/types'

// ASSETS
import { IconAdd } from '@/assets/icons/IconAdd'
import { IconUndo } from '@/assets/icons/IconUndo'
import { AnimatePresence } from 'motion/react'
import Toast from '@/shared/ui/Toast/Toast'
import Typography from '@/shared/ui/Typography/Typography'

const MOCKED_SUBS: Subscription[] = [
  {
    id: 'claude-pro',
    name: 'Claude Pro',
    price: 20.0,
    currency: 'USD',
    billingCycle: 'monthly',
    firstBillDate: '2026-10-02',
    nextBillDate: '2026-11-01',
    categoryId: 'AI & Tools',
    reminders: [],
    brandColor: '#D97706',
    iconUrl: '/logos/logo_claude.webp',
    status: 'inactive',
    createdAt: '2026-10-02',
  },
  {
    id: 'midjourney',
    name: 'Midjourney',
    price: 10.0,
    currency: 'USD',
    billingCycle: 'monthly',
    firstBillDate: '2026-10-05',
    nextBillDate: '2026-11-05',
    categoryId: 'AI & Tools',
    reminders: [],
    brandColor: '#8f06d9c8',
    iconUrl: '/logos/logo_midjourney.webp',
    status: 'active',
    createdAt: '2026-10-02',
  },
  {
    id: 'spotify',
    name: 'Spotify',
    price: 3.98,
    currency: 'USD',
    billingCycle: 'monthly',
    firstBillDate: '2026-09-28',
    nextBillDate: '2026-10-28',
    categoryId: 'Entertaiment',
    reminders: [],
    brandColor: '#22d906',
    iconUrl: '/logos/logo_spotify.webp',
    status: 'active',
    createdAt: '2026-09-28',
  },
]

import styles from './HomePage.module.scss'

export const HomePage: React.FC = () => {
  const { container, header, toastContent, undoButton, fabWrapper, fabContainer, fabButton } = styles
  const [lastDeleted, setLastDeleted] = useState<Subscription | null>(null)

  const subs = useSubscriptionStore((state) => state.subscriptions)
  const addSubscription = useSubscriptionStore((state) => state.addSubscription)
  const deleteSubscription = useSubscriptionStore((state) => state.deleteSubscription)
  const pushOverlay = useUIStore((state) => state.pushOverlay)

  const handleDelete = (sub: Subscription) => {
    deleteSubscription(sub.id)
    setLastDeleted(sub)
  }

  const handleUndo = () => {
    addSubscription(lastDeleted!)
    setLastDeleted(null)
  }

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

      <SubscriptionList subscriptions={subs} onDelete={handleDelete} />
      <AnimatePresence>
        {lastDeleted && (
          <Toast
            position="bottom"
            type="success"
            onDismiss={() => {
              setLastDeleted(null)
            }}
            message={
              <div className={toastContent}>
                <Typography variant="body" size="medium">
                  {`Se eliminó ${lastDeleted.name} exitosamente`}
                </Typography>
                <button
                  onClick={handleUndo}
                  className={undoButton}
                >
                  <IconUndo classname="w-5 h-5" />
                </button>
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
