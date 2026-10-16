// ASSETS
import { IconChartPie } from '@/assets/icons/IconChartPie'

import styles from './StatisticsPage.module.scss'

/** Placeholder until the screen is built (v1.x): describes what it will show. */
export const StatisticsPage = () => {
  const { container, title, subtitle, card, iconContainer, icon, cardTitle, cardText } =
    styles

  return (
    <div className={container}>
      <div>
        <h1 className={title}>Analytics</h1>
        <p className={subtitle}>Cost distribution and category breakdown</p>
      </div>

      <div className={card}>
        <div className={iconContainer}>
          <IconChartPie className={icon} strokeWidth={1.75} />
        </div>
        <p className={cardTitle}>Category Expense Analysis</p>
        <p className={cardText}>
          Visual percentages of your monthly spending by category (Entertainment, Cloud,
          AI, etc.) will appear here.
        </p>
      </div>
    </div>
  )
}
