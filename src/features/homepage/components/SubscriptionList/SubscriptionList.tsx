// HOOKS
import { useState } from 'react'

// TYPES
import { type Subscription } from '@/shared/types'

// COMPONENTS
import SubscriptionListSkeleton from './SubscriptionListSkeleton'
import SubscriptionCard from './SubscriptionCard'
import Typography from '@/shared/ui/Typography/Typography'
import Pill from '@/shared/ui/Pill/Pill'

// ASSETS
import { IconAddEmpty } from '@/assets/icons/IconAddEmpty'
import styles from './SubscriptionList.module.scss'

interface Props {
  subscriptions: Subscription[]
  isLoading?: boolean
  onDelete: (arg0: Subscription) => void
}

const isDisabled = (status: string) => {
  return status == 'inactive'

}

const SubscriptionList = ({ subscriptions, isLoading, onDelete }: Props) => {
  const { container } = styles
  const hasSubscriptions = (subscriptions ?? []).length > 0
  const [activeTab, setActiveTab] = useState('Todas')

  // All Unique Filter tabs + 'All' tab
  const categories = [
    'Todas',
    ...new Set(subscriptions.map((sub) => sub.categoryId)),
    'Inactivas',
  ]
  const filteredSubscriptions =
    activeTab === 'Todas'
      ? subscriptions
      : activeTab === 'Inactivas'
        ? subscriptions.filter(
            (sub) => 'inactive' == sub.status
          )
        : subscriptions.filter((sub) => activeTab == sub.categoryId)

  const sortedSubscriptions = [...filteredSubscriptions].sort((a, b) => {
    // 1. Sort by Status (Active first)
    if (isDisabled(a.status) !== isDisabled(b.status)) {
      return isDisabled(a.status) ? 1 : -1
    }
    
    // 2. Sort Alphabetically
    return a.name.localeCompare(b.name)
  })

  if (isLoading) {
    return <SubscriptionListSkeleton />
  }

  return (
    <div className={`flex flex-col gap-4`}>
      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {categories.map((cat) => (
          <Pill key={cat} isActive={activeTab === cat} onClick={() => setActiveTab(cat)} className="shrink-0">
            <Typography variant="label" size="small">
              {cat}
            </Typography>
          </Pill>
        ))}
      </div>
      {/* Subscription List Section */}
      <div className={`flex flex-col ${container} gap-3 rounded-2xl`}>
        <div className="flex items-center justify-between px-1">
          <Typography variant="title">Tus subscripciones</Typography>
        </div>

        {/* Empty State placeholder */}
        {!hasSubscriptions ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-8 text-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 border">
              <IconAddEmpty />
            </div>
            <Typography variant="body" size="medium">
              Sin subscripciones aún
            </Typography>
            <Typography variant="body">
              Agrega tus gastos mensuales para mantenerte al tanto de tus días de pago y
              tu gasto total.
            </Typography>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 align-middle">
            {sortedSubscriptions.map((sub) => (
              <SubscriptionCard key={sub.id} subscription={sub} onDelete={onDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SubscriptionList
