// DEPENDENCIES
import React, { useState } from 'react'

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

export const HomePage: React.FC = () => {
  const [pendingDelete, setPendingDelete] = useState<Subscription | null>(null)
  const [subs, setSubs] = useState(MOCKED_SUBS)

  const NonDeletedSubList = subs.filter((sub) => sub.id !== pendingDelete?.id)
  const ActiveSubsAmount = NonDeletedSubList.filter(
    (sub) => sub.status == 'active',
  ).length
  const MonthlyCost = () => {
    let sum = 0
    NonDeletedSubList.forEach((sub) => {
      if (sub.status == 'active') {
        sum += sub.price
      }
    })
    return sum.toString()
  }
  return (
    <div className="flex flex-col gap-6">
      <MonthlyExpenses
        title="Gastos Mensuales"
        monthlyAmount={MonthlyCost()}
        subscriptionAmount={ActiveSubsAmount}
      />

      <SubscriptionList
        subscriptions={NonDeletedSubList}
        onDelete={(sub) => setPendingDelete(sub)}
      />
      <AnimatePresence>
        {pendingDelete && (
          <Toast
            position="bottom"
            type="success"
            onDismiss={() => {
              console.log(`Permanently deleting ${pendingDelete.id}...`)
              setSubs(subs.filter(sub => sub.id !== pendingDelete.id))
              setPendingDelete(null) // <--- CRITICAL FIX! Hide the toast
            }}
            message={
              <div className="flex w-full items-center justify-between mr-3">
                <Typography variant='body' size='small' >
                  {`Se eliminó ${pendingDelete.name} exitosamente`}
                </Typography>
                <button
                  onClick={() => setPendingDelete(null)} // Cancel the delete
                  className="flex items-center gap-1 hover:text-[#7BAA39] transition-colors"
                >
                  <IconUndo classname="w-5 h-5" />
                </button>
              </div>
            }
          />
        )}
      </AnimatePresence>
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-md pointer-events-none z-30 px-5 flex justify-end">
        <div className="pointer-events-auto">
          <Button
            variant="primary"
            size="large"
            aria-label="Agregar Subscripción"
            onClick={() => console.log('Add subscription clicked')}
            className="!rounded-full !py-6"
          >
            <IconAdd />
          </Button>
        </div>
      </div>
    </div>
  )
}
