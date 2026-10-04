// ASSETS
import styles from './MonthlyExpenses.module.scss'

const MonthlyExpensesSkeleton = () => {
  const { skeleton, skeletonElement } = styles
  return (
    <div className={`flex flex-col w-full p-6 rounded-xl gap-4 ${skeleton} animate-pulse`}>
      <div className={`flex gap-2 items-center justify-between`}>
        <div className={`w-50 p-2.75 rounded-lg ${skeletonElement}`} />
        <div className={`w-15 p-3 rounded-xl ${skeletonElement}`} />
      </div>
      <div className={`w-20 p-4 rounded-xl ${skeletonElement}`} />
      <div className={`w-50 p-2.75 rounded-lg ${skeletonElement}`} />
    </div>
  )
}

export default MonthlyExpensesSkeleton
