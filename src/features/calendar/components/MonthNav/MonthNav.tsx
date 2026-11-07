// DATA
import { MONTHS } from '@/shared/lib/calendar'

// COMPONENTS
import IconButton from '@/shared/ui/IconButton/IconButton'
import Typography from '@/shared/ui/Typography/Typography'

// ASSETS
import { IconArrow } from '@/assets/icons/IconArrow'

import styles from './MonthNav.module.scss'

interface Props {
  /** The year on screen, e.g. 2026. */
  year: number
  /** The month on screen, 0-11 (0 is January), like `Date.getMonth()`. */
  month: number
  /** Shows the "Hoy" button. The page sets it when the month on screen isn't today's. */
  showToday: boolean
  /** The ‹ arrow was tapped. */
  onPrevious: () => void
  /** The › arrow was tapped. */
  onNext: () => void
  /** "Hoy" was tapped. */
  onToday: () => void
}

/**
 * The Calendario's month row: ‹ arrow, "Noviembre 2026" with an optional "Hoy" button beside the › arrow.
 * It holds no state: the page owns the month on screen (the grid, the day sheet and the
 * total all read it) and decides what each tap means.
 *
 * @example
 * <MonthNav
 *   year={view.year}
 *   month={view.month}
 *   showToday={!isCurrentMonth}
 *   onPrevious={() => goToMonth(-1)}
 *   onNext={() => goToMonth(1)}
 *   onToday={goToToday}
 * />
 */
const MonthNav = ({ year, month, showToday, onPrevious, onNext, onToday }: Props) => {
  const { container, actions, nextIcon } = styles
  return (
    <div className={container}>
      <IconButton label="Mes anterior" onClick={onPrevious}>
        <IconArrow />
      </IconButton>
      <Typography size="md" variant="label">{`${MONTHS[month]} ${year}`}</Typography>
      <div className={actions}>
        {showToday && (
          <IconButton onClick={onToday} label="Hoy, volver al mes actual">
            <Typography size="sm" variant="label">
              Hoy
            </Typography>
          </IconButton>
        )}
        <IconButton label="Mes siguiente" onClick={onNext}>
          <IconArrow className={nextIcon} />
        </IconButton>
      </div>
    </div>
  )
}

export default MonthNav
