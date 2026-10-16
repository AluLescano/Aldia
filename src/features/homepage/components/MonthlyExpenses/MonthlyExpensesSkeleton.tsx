// ASSETS
import styles from './MonthlyExpenses.module.scss'

const MonthlyExpensesSkeleton = () => {
  const {
    skeleton,
    skeletonElement,
    skeletonHeader,
    skeletonTitle,
    skeletonPill,
    skeletonAmount,
    skeletonSubtitle,
  } = styles
  return (
    <div className={skeleton}>
      <div className={skeletonHeader}>
        <div className={`${skeletonElement} ${skeletonTitle}`} />
        <div className={`${skeletonElement} ${skeletonPill}`} />
      </div>
      <div className={`${skeletonElement} ${skeletonAmount}`} />
      <div className={`${skeletonElement} ${skeletonSubtitle}`} />
    </div>
  )
}

export default MonthlyExpensesSkeleton
