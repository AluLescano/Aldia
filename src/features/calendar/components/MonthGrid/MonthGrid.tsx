// DEPENDENCIES
import { useRef } from 'react'
import { motion, useReducedMotion, type PanInfo } from 'motion/react'

// UTILS
import { countText } from '@/features/calendar/utils/countText'
import { fullDate, WEEKDAYS } from '@/shared/lib/calendar'
import { cn } from '@/shared/lib/cn'

// TYPES
import type { Charge } from '@/features/subscriptions/utils/subscriptionHistory'
import type { Subscription } from '@/shared/types'

// COMPONENTS
import Typography from '@/shared/ui/Typography/Typography'
import Button from '@/shared/ui/Button/Button'
import DayLogos, { MAX_LOGOS } from '../DayLogos/DayLogos'

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
  /** Each day's free trials, from `trialsByDay`: those tiles get the champagne wash. */
  trials: Map<string, Subscription[]>
  /** A tile was tapped: the page opens that day's sheet. */
  onSelectDay: (day: string) => void
  /** A horizontal swipe: 1 to the next month (swiped left), -1 to the previous one. */
  onSwipe: (delta: number) => void
  /** Which way the month last moved (1, -1, or 0 at first): the tiles slide in from there. */
  direction: number
}

// How far (px) a finger has to travel sideways, more than up or down, to change the month
const SWIPE_DISTANCE = 50

/**
 * The Calendario's month grid: the weekday row and 42 day tiles (6 weeks from the Sunday of
 * the 1st's week, see `getMonthGrid`). The month's days sit on the raised surface, the
 * neighbour months' days sink into the screen color, and today gets a ring and a dot. Each
 * tile shows its day's logos (`DayLogos`); free trial days get a soft champagne wash, and the
 * trial's logo shows on its first day. Swipe sideways to change the month; the tiles slide
 * in from the side it went to.
 *
 * @example
 * // November 2026: Nov 1 (a Sunday) to Dec 12
 * <MonthGrid
 *   days={days}
 *   month={10}
 *   today="2026-11-07"
 *   byDay={byDay}
 *   subsById={subsById}
 *   trials={trials}
 *   onSelectDay={setSelectedDate}
 *   onSwipe={goToMonth}
 *   direction={direction}
 * />
 */
const MonthGrid = ({
  days,
  month,
  today,
  byDay,
  subsById,
  trials,
  onSelectDay,
  onSwipe,
  direction,
}: Props) => {
  const reduceMotion = useReducedMotion()
  // A swipe that ends on a tile would also "tap" it: this skips that tap. It's set while the
  // finger moves (not when the swipe ends): Motion reports the end a frame after the click
  const wasSwiped = useRef(false)

  const handlePan = (_: PointerEvent, { offset }: PanInfo) => {
    if (Math.abs(offset.x) > 10 && Math.abs(offset.x) > Math.abs(offset.y))
      wasSwiped.current = true
  }

  const handlePanEnd = (_: PointerEvent, { offset }: PanInfo) => {
    const isSideways = Math.abs(offset.x) > Math.abs(offset.y)
    if (!isSideways || Math.abs(offset.x) < SWIPE_DISTANCE) return
    onSwipe(offset.x < 0 ? 1 : -1) // finger to the left = next month
  }

  const handleTap = (date: string) => {
    if (wasSwiped.current) {
      wasSwiped.current = false
      return
    }
    onSelectDay(date)
  }

  const {
    container,
    weekdays,
    weekday,
    grid,
    cell,
    dayCard,
    day,
    isToday,
    outside,
    trial,
    more,
    fadedMore,
  } = styles

  return (
    <motion.div
      className={container}
      // Vertical drags still scroll the page; sideways ones come here as a pan
      style={{ touchAction: 'pan-y' }}
      onPan={handlePan}
      onPanEnd={handlePanEnd}
      onPointerDown={() => {
        wasSwiped.current = false
      }}
    >
      <div className={weekdays} aria-hidden="true">
        {WEEKDAYS.map((letter, key) => (
          <Typography key={key} variant="overline" size="xs" className={weekday}>
            {letter}
          </Typography>
        ))}
      </div>
      <motion.div
        key={days[0]} // a new month mounts a new grid, which slides in
        className={grid}
        initial={
          direction === 0 || reduceMotion ? false : { x: direction * 48, opacity: 0 }
        }
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        {days.map((date) => {
          // '2026-11-15' -> 10: the date's month in the same 0-11 as `month`. No need to
          // compare years: a grid spans 3 neighbour months, and even Dec / Jan differ
          const isOutside = Number(date.slice(5, 7)) - 1 !== month
          const charges = byDay.get(date) ?? []
          const dayTrials = trials.get(date) ?? []
          const trialStarts = dayTrials.filter((sub) => sub.trial?.startDate === date)
          const extra = trialStarts.length + charges.length - MAX_LOGOS
          const label =
            dayTrials.length > 0
              ? `${countText(charges.length)}, prueba gratis`
              : countText(charges.length)

          return (
            <div key={date} className={cell}>
              <Button
                width="full"
                size="medium"
                variant="secondary"
                type="button"
                onClick={() => handleTap(date)}
                aria-label={`${fullDate(date)}: ${label}`}
                className={cn(
                  dayCard,
                  date === today && isToday,
                  isOutside && outside,
                  dayTrials.length > 0 && trial,
                )}
              >
                <DayLogos
                  charges={charges}
                  trialStarts={trialStarts}
                  subsById={subsById}
                  isOutside={isOutside}
                />
                <Typography variant="label" size="sm" className={day}>
                  {Number(date.slice(8))}
                </Typography>
              </Button>
              {extra > 0 && (
                <span className={cn(more, isOutside && fadedMore)}>+{extra}</span>
              )}
            </div>
          )
        })}
      </motion.div>
    </motion.div>
  )
}

export default MonthGrid
