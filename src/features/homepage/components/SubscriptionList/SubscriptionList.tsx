// DEPENDENCIES
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

// STORES
import { useCategoryStore } from '@/features/categories/store/categoryStore'

// UTILS
import {
  filterKey,
  filterSubscriptions,
  listFilters,
  sortSubscriptions,
  type ListFilter,
} from '@/features/subscriptions/utils/subscriptionList'

// COMPONENTS
import SubscriptionListSkeleton from './SubscriptionListSkeleton'
import SubscriptionCard from './SubscriptionCard'
import Typography from '@/shared/ui/Typography/Typography'
import Pill from '@/shared/ui/Pill/Pill'

// TYPES
import type { Subscription } from '@/shared/types'

// ASSETS
import { IconAddEmpty } from '@/assets/icons/IconAddEmpty'
import styles from './SubscriptionList.module.scss'

interface Props {
  subscriptions: Subscription[]
  isLoading?: boolean
  /** Called from a card's swipe-to-delete button. */
  onDelete: (subscription: Subscription) => void
}

/** Filter tabs plus the list of subscription cards (or an empty state). */
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

  const [chosenFilter, setChosenFilter] = useState<ListFilter>({ type: 'all' })
  const categories = useCategoryStore((state) => state.categories)

  const filters = listFilters(subscriptions)

  // A tab can disappear while selected (resume the last paused one, delete the last of a
  // category). Derived, not stored: if the chosen tab is gone, the list shows "all".
  const activeFilter = filters.some((f) => filterKey(f) === filterKey(chosenFilter))
    ? chosenFilter
    : filters[0]

  // Category tabs show the category's current name, so renaming one renames its tab
  const filterLabel = (filter: ListFilter) => {
    if (filter.type === 'all') return 'Todas'
    if (filter.type === 'inactive') return 'Inactivas'
    return categories.find((c) => c.id === filter.categoryId)?.name ?? filter.categoryId
  }

  const visible = sortSubscriptions(filterSubscriptions(subscriptions, activeFilter))

  if (isLoading) {
    return <SubscriptionListSkeleton />
  }

  return (
    <div className={wrapper}>
      <div className={filterTabs}>
        {filters.map((filter) => (
          <Pill
            key={filterKey(filter)}
            isActive={filterKey(filter) === filterKey(activeFilter)}
            layoutId="homeFilter" // the green background slides to the tapped filter
            onClick={() => setChosenFilter(filter)}
            className={filterPill}
          >
            <Typography variant="label" size="xs">
              {filterLabel(filter)}
            </Typography>
          </Pill>
        ))}
      </div>

      <div className={container}>
        <div className={header}>
          <Typography variant="title">Tus subscripciones</Typography>
        </div>

        <div className={listArea}>
          {subscriptions.length === 0 ? (
            <div className={emptyState}>
              <div className={emptyStateIcon}>
                <IconAddEmpty />
              </div>
              <Typography variant="body" size="md">
                Sin subscripciones aún
              </Typography>
              <Typography variant="body" size="sm">
                Agrega tus gastos mensuales para mantenerte al tanto de tus días de pago y
                tu gasto total.
              </Typography>
            </div>
          ) : (
            <motion.div layout className={cardsContainer}>
              <AnimatePresence mode="popLayout" initial={false}>
                {visible.map((sub) => (
                  <motion.div
                    key={sub.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    exit={{
                      opacity: 0,
                      scale: 0.9,
                      filter: 'blur(4px)',
                      transition: { duration: 0.2 },
                    }}
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
