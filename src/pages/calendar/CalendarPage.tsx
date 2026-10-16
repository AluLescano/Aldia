// ASSETS
import { IconCalendarMonth } from '@/assets/icons/IconCalendarMonth'

import styles from './CalendarPage.module.scss'

/** Placeholder until the screen is built (v1.x): describes what it will show. */
export const CalendarPage = () => {
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
          <IconCalendarMonth className={icon} strokeWidth={1.75} />
        </div>
        <p className={cardTitle}>Interactive Calendar View</p>
        <p className={cardText}>
          Charge days and card expiration dates will be displayed here in a monthly grid.
        </p>
      </div>
    </div>
  )
}
