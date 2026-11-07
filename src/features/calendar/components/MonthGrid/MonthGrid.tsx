// UTILS
import { getMonthGrid, WEEKDAYS } from '@/shared/lib/calendar'
import { cn } from '@/shared/lib/cn'

// COMPONENTS
import Typography from '@/shared/ui/Typography/Typography'

// ASSETS
import styles from './MonthGrid.module.scss'

interface Props {
  /** The year on screen, e.g. 2026. */
  year: number
  /** The month on screen, 0-11 (0 is January), like `Date.getMonth()`. */
  month: number
  /** `YYYY-MM-DD`, from the page, so the grid and the month row agree on what today is. */
  today: string
}

/**
 * The Calendario's month grid: the weekday row and 42 day tiles (6 weeks from the Sunday of
 * the 1st's week, see `getMonthGrid`). The month's days sit on the raised surface, the
 * neighbour months' days sink into the screen color, and today gets a ring and a dot.
 *
 * @example
 * <MonthGrid year={2026} month={10} today="2026-11-06" /> // Nov 1 (a Sunday) to Dec 12
 */
const MonthGrid = ({ year, month, today }: Props) => {
  const {
    container,
    weekdays,
    weekday,
    grid,
    dayCard,
    subsContainer,
    day,
    isToday,
    outside,
  } = styles
  const days = getMonthGrid(year, month) // 42 'YYYY-MM-DD' strings

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

          return (
            <div
              key={date}
              className={cn(dayCard, date === today && isToday, isOutside && outside)}
            >
              {/* The day's logos go here (C2.4) */}
              <div className={subsContainer}></div>
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
