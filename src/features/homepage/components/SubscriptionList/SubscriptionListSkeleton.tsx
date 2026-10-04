// ASSETS
import styles from './SubscriptionList.module.scss'

const SubscriptionListSkeleton = () => {
  const { skeleton, skeletonElement } = styles
  return (
    <div className="flex flex-col w-full gap-3">
      <div className={`flex gap-2 mb-3`}>
        {/* Filter section */}
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className={`w-full p-3 rounded-2xl ${skeleton} animate-pulse`}
          />
        ))}
      </div>
      {/* Card section */}
      <div className={`flex flex-col w-full gap-3 pt-3 pb-7 px-2 rounded-xl ${skeleton} animate-pulse`}>
        <div className={`w-40 p-2.75 rounded-lg ${skeletonElement}`} />
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className={`h-15 rounded-2xl ${skeletonElement} `} />
        ))}
      </div>
    </div>
  )
}

export default SubscriptionListSkeleton
