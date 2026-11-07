// UTILS
import { cn } from '@/shared/lib/cn'

// COMPONENTS
import Typography from '@/shared/ui/Typography/Typography'

// ASSETS
import styles from './CalendarLegend.module.scss'

interface Props {
  /** Today is in the month on screen. */
  hasToday: boolean
  /** Some day of the month on screen is a free trial day. */
  hasTrial: boolean
}

/**
 * The row under the Calendario that names each mark on the tiles, listing only the ones the
 * month on screen has (no row at all when it has none). Hidden from screen readers: each tile
 * already says it in its own label ("…: 1 cobro, prueba gratis").
 *
 * @example
 * <CalendarLegend hasToday={isCurrentMonth} hasTrial={monthHasTrial} />
 */
const CalendarLegend = ({ hasToday, hasTrial }: Props) => {
  const { legend, item, swatch, today, trial } = styles
  if (!hasToday && !hasTrial) return null

  return (
    <div className={legend} aria-hidden="true">
      {hasToday && (
        <span className={item}>
          <span className={cn(swatch, today)} />
          <Typography variant="label" size="xs">
            Hoy
          </Typography>
        </span>
      )}
      {hasTrial && (
        <span className={item}>
          <span className={cn(swatch, trial)} />
          <Typography variant="label" size="xs">
            Prueba gratis
          </Typography>
        </span>
      )}
    </div>
  )
}

export default CalendarLegend
