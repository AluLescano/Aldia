// UTILS
import { WEEKDAYS } from '@/shared/lib/calendar'
import { cn } from '@/shared/lib/cn'

// TYPES
import type { Charge } from '@/features/subscriptions/utils/subscriptionHistory'
import type { Subscription } from '@/shared/types'

// COMPONENTS
import Typography from '@/shared/ui/Typography/Typography'
import DayLogos from '../DayLogos/DayLogos'

// ASSETS
import styles from './MonthGrid.module.scss'

interface Props {
  /** The 42 `YYYY-MM-DD` days to draw, from `getMonthGrid` (the page builds them). */
  days: string[]
  /** The month on screen, 0-11 (0 is January), like `Date.getMonth()`. */
  month: number
  /** `YYYY-MM-DD`, from the page, so the grid and the month row agree on what today is. */
  today: string
  /** Each day's charges, from `chargesByDay`. Days with none aren't in it. */
  byDay: Map<string, Charge[]>
  /** Every subscription by id, to draw a charge's logo. */
  subsById: Map<string, Subscription>
}

/**
 * The Calendario's month grid: the weekday row and 42 day tiles (6 weeks from the Sunday of
 * the 1st's week, see `getMonthGrid`). The month's days sit on the raised surface, the
 * neighbour months' days sink into the screen color, and today gets a ring and a dot. Each
 * tile shows its day's logos (`DayLogos`).
 *
 * @example
 * // November 2026: Nov 1 (a Sunday) to Dec 12
 * <MonthGrid days={days} month={10} today="2026-11-07" byDay={byDay} subsById={subsById} />
 */
const MonthGrid = ({ days, month, today, byDay, subsById }: Props) => {
  const { container, weekdays, weekday, grid, dayCard, day, isToday, outside } = styles

  return (
    <div className={container}>
      <div className={weekdays} aria-hidden="true">
        {WEEKDAYS.map((letter, key) => (
          <Typography key={key} variant="overline" size="xs" className={weekday}>
            {letter}
          </Typography>
        ))}
      </div>
      <div className={grid}>
        {days.map((date) => {
          // '2026-11-15' -> 10: the date's month in the same 0-11 as `month`. No need to
          // compare years: a grid spans 3 neighbour months, and even Dec / Jan differ
          const isOutside = Number(date.slice(5, 7)) - 1 !== month
          const charges = byDay.get(date) ?? []

          return (
            <div
              key={date}
              className={cn(dayCard, date === today && isToday, isOutside && outside)}
            >
              <DayLogos charges={charges} subsById={subsById} isOutside={isOutside} />
              <Typography variant="label" size="sm" className={day}>
                {Number(date.slice(8))}
              </Typography>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default MonthGrid
