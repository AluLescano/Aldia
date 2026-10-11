// HOOKS
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

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
  const {
    container,
    wrapper,
    filterTabs,
    filterPill,
    header,
    listArea,
    emptyState,
    emptyStateIcon,
    cardsContainer,
    cardMotionWrapper,
  } = styles

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
    <div className={wrapper}>
      {/* Filter Tabs */}
      <div className={filterTabs}>
        {categories.map((cat) => (
          <Pill key={cat} isActive={activeTab === cat} onClick={() => setActiveTab(cat)} className={filterPill}>
            <Typography variant="label" size="small">
              {cat}
            </Typography>
          </Pill>
        ))}
      </div>
      
      {/* Subscription List Section */}
      <div className={container}>
        <div className={header}>
          <Typography variant="title">Tus subscripciones</Typography>
        </div>

        {/* Scrollable List Area */}
        <div className={listArea}>
          {!hasSubscriptions ? (
            <div className={emptyState}>
              <div className={emptyStateIcon}>
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
            <motion.div layout className={cardsContainer}>
              <AnimatePresence mode="popLayout" initial={false}>
                {sortedSubscriptions.map((sub) => (
                  <motion.div
                    key={sub.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 0.9, filter: 'blur(4px)', transition: { duration: 0.2 } }}
                    className={cardMotionWrapper}
                  >
                    <SubscriptionCard subscription={sub} onDelete={onDelete} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SubscriptionList
