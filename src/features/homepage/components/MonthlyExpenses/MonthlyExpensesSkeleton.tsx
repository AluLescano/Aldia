import { cn } from '@/shared/lib/cn'

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
        <div className={cn(skeletonElement, skeletonTitle)} />
        <div className={cn(skeletonElement, skeletonPill)} />
      </div>
      <div className={cn(skeletonElement, skeletonAmount)} />
      <div className={cn(skeletonElement, skeletonSubtitle)} />
    </div>
  )
}

export default MonthlyExpensesSkeleton
