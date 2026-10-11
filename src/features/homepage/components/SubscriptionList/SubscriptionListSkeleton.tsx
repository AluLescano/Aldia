// ASSETS
import styles from './SubscriptionList.module.scss'

const SubscriptionListSkeleton = () => {
  const { skeletonList, skeletonFilters, skeletonFilter, skeletonCards, skeletonTitle, skeletonCard } = styles
  return (
    <div className={skeletonList}>
      <div className={skeletonFilters}>
        {/* Filter section */}
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className={skeletonFilter}
          />
        ))}
      </div>
      {/* Card section */}
      <div className={skeletonCards}>
        <div className={skeletonTitle} />
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className={skeletonCard} />
        ))}
      </div>
    </div>
  )
}

export default SubscriptionListSkeleton
