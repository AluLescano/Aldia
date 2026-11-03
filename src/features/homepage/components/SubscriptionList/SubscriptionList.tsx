// DEPENDENCIES
import { useState, type ComponentType } from 'react'
import { motion, AnimatePresence } from 'motion/react'

// STORES
import { useCategoryStore } from '@/features/categories/store/categoryStore'

// UTILS
import { cn } from '@/shared/lib/cn'
import {
  filterKey,
  filterSubscriptions,
  listFilters,
  sortSubscriptions,
  type ListFilter,
  type ListSort,
  type SortContext,
} from '@/features/subscriptions/utils/subscriptionList'
import { todayISO } from '@/shared/lib/isoDate'
import { useSettingsStore } from '@/features/settings/store/settingsStore'
import { useRatesStore } from '@/shared/store/ratesStore'

// COMPONENTS
import SubscriptionListSkeleton from './SubscriptionListSkeleton'
import SubscriptionCard from './SubscriptionCard'
import Typography from '@/shared/ui/Typography/Typography'
import Pill from '@/shared/ui/Pill/Pill'
import Button from '@/shared/ui/Button/Button'
import BottomSheet from '@/shared/ui/BottomSheet/BottomSheet'

// TYPES
import type { Subscription } from '@/shared/types'
import type { IconProps } from '@/assets/icons/Icon'

// ASSETS
import { IconAddEmpty } from '@/assets/icons/IconAddEmpty'
import { IconCheck } from '@/assets/icons/IconCheck'
import { IconSort } from '@/assets/icons/IconSort'
import { IconCalendarClock } from '@/assets/icons/IconCalendarClock'
import { IconSortAZ } from '@/assets/icons/IconSortAZ'
import { IconSortZA } from '@/assets/icons/IconSortZA'
import { IconSort10 } from '@/assets/icons/IconSort10'
import { IconSort01 } from '@/assets/icons/IconSort01'

import styles from './SubscriptionList.module.scss'

interface Props {
  /** All of them: the filter tabs pick which ones show, and the list sorts them. */
  subscriptions: Subscription[]
  /** Shows the skeleton instead of the list. */
  isLoading?: boolean
  /** Called from a card's swipe-to-delete button. */
  onDelete: (subscription: Subscription) => void
}

/** One way to order the list: the chip in the header shows it, the sheet lists all of them. */
interface SortOption {
  sort: ListSort
  /** In the sheet: says it in full. */
  label: string
  /** On the chip: short, so it fits next to the title. */
  shortLabel: string
  Icon: ComponentType<IconProps>
}

const SORT_OPTIONS: SortOption[] = [
  {
    sort: 'next-charge',
    label: 'Próximo cobro',
    shortLabel: 'Próximo cobro',
    Icon: IconCalendarClock,
  },
  {
    sort: 'name-asc',
    label: 'Nombre (A-Z)',
    shortLabel: 'A-Z',
    Icon: IconSortAZ,
  },
  {
    sort: 'name-desc',
    label: 'Nombre (Z-A)',
    shortLabel: 'Z-A',
    Icon: IconSortZA,
  },
  {
    sort: 'price-asc',
    label: 'Precio: menor a mayor',
    shortLabel: 'Menor precio',
    Icon: IconSort01,
  },
  {
    sort: 'price-desc',
    label: 'Precio: mayor a menor',
    shortLabel: 'Mayor precio',
    Icon: IconSort10,
  },
]

/** Filter tabs plus the list of subscription cards (or an empty state). */
const SubscriptionList = ({ subscriptions, isLoading, onDelete }: Props) => {
  const {
    container,
    wrapper,
    filterTabs,
    filterPill,
    scrollArea,
    header,
    listArea,
    emptyState,
    emptyStateIcon,
    cardsContainer,
    cardMotionWrapper,
    sortIcon,
    sortList,
    sortRow,
    sortRowSelected,
    sortRowIcon,
    sortCheck,
  } = styles

  const [chosenFilter, setChosenFilter] = useState<ListFilter>({ type: 'all' })
  const [isSortOpen, setIsSortOpen] = useState(false)
  const categories = useCategoryStore((state) => state.categories)
  // The last sort picked, remembered between opens
  const sort = useSettingsStore((state) => state.listSort)
  const setListSort = useSettingsStore((state) => state.setListSort)
  const currency = useSettingsStore((state) => state.selectedCurrency)
  const rates = useRatesStore((state) => state.rates)

  const filters = listFilters(subscriptions)

  // Falls back to the first one if the saved sort no longer exists
  const currentSort =
    SORT_OPTIONS.find((option) => option.sort === sort) ?? SORT_OPTIONS[0]

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

  const context: SortContext = {
    today: todayISO(),
    currency: currency,
    rates: rates,
  }

  const visible = sortSubscriptions(
    filterSubscriptions(subscriptions, activeFilter),
    sort,
    context,
  )

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

      {/* The only part of Home that scrolls: the whole card moves, the filters stay */}
      <div className={scrollArea}>
        <div className={container}>
          <div className={header}>
            <Typography variant="title">Tus subscripciones</Typography>
            {/* Shows the current sort; the aria-label says it in full ("A-Z" alone doesn't) */}
            <Button
              variant="secondary"
              size="small"
              type="button"
              width="fit"
              onClick={() => setIsSortOpen(true)}
              aria-label={`Ordenar por ${currentSort.label}`}
            >
              <IconSort className={sortIcon} />
              <Typography variant="label" size="sm">
                {currentSort.shortLabel}
              </Typography>
            </Button>
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
                  Agrega tus gastos mensuales para mantenerte al tanto de tus días de pago
                  y tu gasto total.
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

      <BottomSheet
        isOpen={isSortOpen}
        onClose={() => setIsSortOpen(false)}
        title="Ordenar por"
      >
        {/* Pick one of five: radios for screen readers ("Nombre (A-Z), checked, 2 of 5") */}
        <div role="radiogroup" aria-label="Ordenar por" className={sortList}>
          {SORT_OPTIONS.map(({ sort: optionSort, label, Icon }) => {
            const isSelected = optionSort === currentSort.sort
            return (
              <button
                key={optionSort}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => {
                  setListSort(optionSort)
                  setIsSortOpen(false)
                }}
                className={cn(sortRow, isSelected && sortRowSelected)}
              >
                <Icon className={sortRowIcon} />
                <Typography variant="label" size="md">
                  {label}
                </Typography>
                {isSelected && <IconCheck className={sortCheck} />}
              </button>
            )
          })}
        </div>
      </BottomSheet>
    </div>
  )
}

export default SubscriptionList
