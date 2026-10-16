// DEPENDENCIES
import { useState } from 'react'

// UTILS
import { getMonthGrid } from '@/shared/lib/calendar'
import { parseISODate, todayISO } from '@/shared/lib/isoDate'
import { cn } from '@/shared/lib/cn'

// COMPONENTS
import Typography from '@/shared/ui/Typography/Typography'
import IconButton from '../IconButton/IconButton'
import Button from '../Button/Button'

// ASSETS
import { IconArrow } from '@/assets/icons/IconArrow'

import styles from './DatePicker.module.scss'

const {
  calendar,
  header,
  navGroup,
  select,
  nextArrow,
  weekdays,
  weekday,
  grid,
  day,
  muted,
  today,
  selected,
} = styles

interface Props {
  /** The selected day as `YYYY-MM-DD`. The calendar opens on its month (or on today's if empty). */
  value: string
  /** First day that can be picked, as `YYYY-MM-DD`. Earlier days show up disabled. */
  min?: string
  /** Called with the tapped day as `YYYY-MM-DD`. */
  onSelect: (iso: string) => void
}

// What a screen reader says for a day: "martes, 13 de octubre de 2026"
const fullDate = (iso: string) =>
  parseISODate(iso)?.toLocaleDateString('es-AR', { dateStyle: 'full' })

const WEEKDAYS = ['D', 'L', 'M', 'X', 'J', 'V', 'S']

// "octubre" -> "Octubre", built once when the file loads
const MONTHS = Array.from({ length: 12 }, (_, month) => {
  const name = new Date(2000, month, 1).toLocaleDateString('es-AR', { month: 'long' })
  return name.charAt(0).toUpperCase() + name.slice(1)
})

const monthOptions = MONTHS.map((label, value) => ({ value, label }))

interface SelectorProps {
  /** What it picks ("Mes" or "Año"). Also builds the arrows' labels: "Mes anterior", "Mes siguiente". */
  label: string
  /** The value on screen: a month index (0 = January) or a year. */
  value: number
  options: { value: number; label: string }[]
  onChange: (value: number) => void
  onPrevious: () => void
  onNext: () => void
}

/** A `<select>` between a previous and a next arrow. Used twice: for the month and for the year. */
const Selector = ({
  label,
  value,
  options,
  onChange,
  onPrevious,
  onNext,
}: SelectorProps) => (
  <div className={navGroup}>
    <IconButton onClick={onPrevious} label={`${label} anterior`}>
      <IconArrow />
    </IconButton>
    <select
      className={select}
      aria-label={label}
      value={value}
      onChange={(event) => onChange(Number(event.currentTarget.value))}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    <IconButton label={`${label} siguiente`} onClick={onNext}>
      <IconArrow className={nextArrow} />
    </IconButton>
  </div>
)

/**
 * Month calendar for picking one day, made to sit inside a `BottomSheet`.
 * Weeks start on Sunday (D L M X J V S) and there are always 6 rows, with the
 * neighbour months' days dimmed. Today and the selected day are highlighted.
 *
 * @example
 * <DatePicker value={values.firstBillDate} onSelect={(iso) => pick('firstBillDate', iso)} />
 */
const DatePicker = ({ value, min, onSelect }: Props) => {
  // The month on screen is not the same thing as the selected day, so it has its own state
  const todayIso = todayISO()
  const start = parseISODate(value) ?? parseISODate(todayIso)!
  const [view, setView] = useState({ year: start.getFullYear(), month: start.getMonth() })

  const days = getMonthGrid(view.year, view.month)
  const viewedMonth = String(view.month + 1).padStart(2, '0') // "10" for October

  // The list always contains the year on screen, even if the value is far from today
  const thisYear = new Date().getFullYear()
  const firstYear = Math.min(thisYear - 1, view.year)
  const lastYear = Math.max(thisYear + 10, view.year)

  const yearOptions = Array.from({ length: lastYear - firstYear + 1 }, (_, i) => ({
    value: firstYear + i,
    label: String(firstYear + i),
  }))

  const goToMonth = (delta: number) => {
    // new Date(2026, 12, 1) is January 2027, so December + 1 wraps the year by itself
    const next = new Date(view.year, view.month + delta, 1)
    setView({ year: next.getFullYear(), month: next.getMonth() })
  }

  const goToYear = (delta: number) => setView({ ...view, year: view.year + delta })

  return (
    <>
      <div className={calendar}>
        <div className={header}>
          <Selector
            label="Mes"
            value={view.month}
            options={monthOptions}
            onChange={(month) => setView({ ...view, month })}
            onPrevious={() => goToMonth(-1)}
            onNext={() => goToMonth(1)}
          />
          <Selector
            label="Año"
            value={view.year}
            options={yearOptions}
            onChange={(year) => setView({ ...view, year })}
            onPrevious={() => goToYear(-1)}
            onNext={() => goToYear(1)}
          />
        </div>

        <div className={weekdays} aria-hidden="true">
          {WEEKDAYS.map((letter, index) => (
            <Typography key={index} variant="overline" size="small" className={weekday}>
              {letter}
            </Typography>
          ))}
        </div>

        <div className={grid}>
          {days.map((iso) => {
            const isSelected = iso === value
            const isOutsideMonth = iso.slice(5, 7) !== viewedMonth
            const isBeforeMin = min !== undefined && iso < min // ISO dates compare like text

            return (
              <Button
                key={iso}
                variant="secondary"
                size="small"
                type="button"
                disabled={isBeforeMin}
                className={cn(
                  day,
                  isOutsideMonth && muted,
                  iso === todayIso && today,
                  isSelected && selected,
                )}
                aria-label={fullDate(iso)}
                aria-pressed={isSelected}
                onClick={() => onSelect(iso)}
              >
                <Typography variant="overline" size="small">
                  {Number(iso.slice(8, 10))}
                </Typography>
              </Button>
            )
          })}
        </div>
      </div>
    </>
  )
}

export default DatePicker
