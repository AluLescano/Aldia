import React from 'react'
import styles from './StatisticsPage.module.scss'

export const StatisticsPage: React.FC = () => {
  const { container, title, subtitle, card, iconContainer, icon, cardTitle, cardText } = styles

  return (
    <div className={container}>
      <div>
        <h1 className={title}>Analytics</h1>
        <p className={subtitle}>
          Cost distribution and category breakdown
        </p>
      </div>

      <div className={card}>
        <div className={iconContainer}>
          <svg
            className={icon}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.75}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z"
            />
          </svg>
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
