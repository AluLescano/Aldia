// HOOKS
import { useState } from 'react'

// TYPES
import type { BillingCycle, BillingUnit } from '@/shared/types'

// COMPONENTS
import Typography from '@/shared/ui/Typography/Typography'
import InputNumber from '@/shared/ui/InputNumber/InputNumber'

// ASSETS
import styles from './BillingCyclePicker.module.scss'

const {
  list,
  card,
  compact,
  selected,
  cardButton,
  content,
  centered,
  wheel,
  wheelItem,
  dimmed,
} = styles

export type BillingChoice =
  { mode: 'one-time' } | { mode: 'every'; interval: number; unit: BillingUnit }

const UNITS: { value: BillingUnit; label: string }[] = [
  { value: 'day', label: 'Día' },
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mes' },
  { value: 'year', label: 'Año' },
]

const DEFAULT_TRIAL_DAYS = 7

// A whole number of 1 or more, or null while the text is empty or invalid
const parsePositive = (text: string) => {
  const value = Number(text)
  return Number.isInteger(value) && value >= 1 ? value : null
}

interface UnitWheelProps {
  value: BillingUnit
  onChange: (unit: BillingUnit) => void
}

// Three visible rows like the Figma wheel: the one before, the chosen one, the one after.
// Tapping the dimmed rows moves the selection (a swipeable wheel can come later).
const UnitWheel = ({ value, onChange }: UnitWheelProps) => {
  const index = UNITS.findIndex((unit) => unit.value === value)
  const rows = [UNITS[index - 1], UNITS[index], UNITS[index + 1]]

  return (
    <div className={wheel} role="group" aria-label="Unidad de tiempo">
      {rows.map((unit, position) =>
        unit ? (
          <button
            key={unit.value}
            type="button"
            className={`${wheelItem} ${position === 1 ? '' : dimmed}`}
            aria-pressed={position === 1}
            onClick={() => onChange(unit.value)}
          >
            {unit.label}
          </button>
        ) : (
          <span key={`empty-${position}`} className={wheelItem} aria-hidden="true" />
        ),
      )}
    </div>
  )
}

interface BodyProps {
  cycle: BillingCycle
  trialDays?: number
  onChange: (choice: BillingChoice) => void
  onTrialChange: (days: number | undefined) => void
}

// Lives inside the sheet, so its state starts fresh every time the sheet opens
const BillingCyclePicker = ({ cycle, trialDays, onChange, onTrialChange }: BodyProps) => {
  const hasTrial = trialDays !== undefined
  const mode = cycle.type === 'one-time' ? 'one-time' : 'every'

  // The text can be empty or invalid for a moment while typing, so it is kept apart
  const [trialText, setTrialText] = useState(String(trialDays ?? DEFAULT_TRIAL_DAYS))
  const [intervalText, setIntervalText] = useState(
    cycle.type === 'every' ? String(cycle.interval) : '1',
  )
  const [unit, setUnit] = useState<BillingUnit>(
    cycle.type === 'every' ? cycle.unit : 'month',
  )

  const changeTrial = (text = trialText) => {
    const days = parsePositive(text)
    if (days !== null) onTrialChange(days)
  }

  const selectEvery = (text = intervalText, nextUnit = unit) => {
    const interval = parsePositive(text)
    if (interval !== null) onChange({ mode: 'every', interval, unit: nextUnit })
  }

  return (
    <div className={list}>
      {/* Trial */}
      <div className={`${card} ${compact} ${hasTrial ? selected : ''}`}>
        <button
          type="button"
          className={cardButton}
          aria-pressed={hasTrial}
          aria-label="Período de prueba"
          onClick={() => (hasTrial ? onTrialChange(undefined) : changeTrial())}
        />
        <div className={content}>
          <Typography variant="body" size="medium">
            Período de prueba
          </Typography>
          <div>
            <InputNumber
              size="medium"
              width="fit"
              style={{ minWidth: 0, padding: '0 1rem' }}
              maxLength={3}
              aria-label="Días de prueba"
              value={trialText}
              errorMessage={parsePositive(trialText) === null ? 'Mínimo 1' : undefined}
              onFocus={() => changeTrial()}
              onChange={(event) => {
                const text = event.currentTarget.value
                setTrialText(text)
                changeTrial(text)
              }}
            />
            <Typography variant="body" size="medium">
              {trialText === '1' ? 'día' : 'días'}
            </Typography>
          </div>
        </div>
      </div>
      {/* One time payment */}
      <div className={`${card} ${compact} ${mode === 'one-time' ? selected : ''}`}>
        <button
          type="button"
          className={cardButton}
          aria-pressed={mode === 'one-time'}
          aria-label="Pago único"
          onClick={() => onChange({ mode: 'one-time' })}
        />
        <div className={content}>
          <Typography variant="body" size="medium">
            Pago único
          </Typography>
        </div>
      </div>
      {/* Every x days/weeks/months/years */}
      <div className={`${card} ${mode === 'every' ? selected : ''}`}>
        <button
          type="button"
          className={cardButton}
          aria-pressed={mode === 'every'}
          aria-label="Cobro recurrente"
          onClick={() => selectEvery()}
        />
        <div className={`${content} ${centered}`}>
          <Typography variant="body" size="medium">
            Cada
          </Typography>
          <div>
            <InputNumber
              size="medium"
              width="fit"
              maxLength={3}
              style={{ minWidth: 0, padding: '0 1rem' }}
              aria-label="Cantidad"
              value={intervalText}
              errorMessage={parsePositive(intervalText) === null ? 'Mínimo 1' : undefined}
              onFocus={() => selectEvery()}
              onChange={(event) => {
                const text = event.currentTarget.value
                setIntervalText(text)
                selectEvery(text)
              }}
            />
            <UnitWheel
              value={unit}
              onChange={(next) => {
                setUnit(next)
                selectEvery(intervalText, next)
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default BillingCyclePicker
