import React from 'react'
import styles from './CalendarPage.module.scss'

export const CalendarPage: React.FC = () => {
  const {
    container,
    header,
    title,
    subtitle,
    card,
    iconContainer,
    icon,
    cardTitle,
    cardText,
  } = styles

  return (
    <div className={container}>
      <div className={header}>
        <h1 className={title}>Calendar</h1>
        <p className={subtitle}>View charges scheduled for each day of the month</p>
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
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
            />
          </svg>
        </div>
        <p className={cardTitle}>Interactive Calendar View</p>
        <p className={cardText}>
          Charge days and card expiration dates will be displayed here in a monthly grid.
        </p>
      </div>
    </div>
  )
}
