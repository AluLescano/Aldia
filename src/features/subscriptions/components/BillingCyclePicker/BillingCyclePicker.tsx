// DEPENDENCIES
import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'

// UTILS
import { cn } from '@/shared/lib/cn'

// TYPES
import type { BillingCycle, BillingUnit } from '@/shared/types'

// COMPONENTS
import Typography from '@/shared/ui/Typography/Typography'
import InputNumber from '@/shared/ui/InputNumber/InputNumber'
import IconButton from '@/shared/ui/IconButton/IconButton'
import Pill from '@/shared/ui/Pill/Pill'
import Switch from '@/shared/ui/Switch/Switch'

// ASSETS
import { IconAdd } from '@/assets/icons/IconAdd'
import { IconMinus } from '@/assets/icons/IconMinus'
import styles from './BillingCyclePicker.module.scss'

const {
  list,
  group,
  caption,
  card,
  row,
  rowButton,
  collapse,
  subRow,
  stepper,
  selected,
  units,
} = styles

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

interface Props {
  /** The cycle currently saved in the form. */
  cycle: BillingCycle
  /** Length of the free trial in days, or `undefined` when there is no trial. */
  trialDays?: number
  /**
   * Shows "Pago único". Only for a subscription that was saved as one before the option was
   * hidden: one-time payments wait for the income and expenses book (the model keeps them).
   */
  allowOneTime?: boolean
  /** Called on every valid change (no confirm button): the form updates live. */
  onChange: (cycle: BillingCycle) => void
  /** Called with the trial length, or `undefined` when the trial is switched off. */
  onTrialChange: (days: number | undefined) => void
}

/**
 * Content of the "Formato del cobro" sheet, in two groups: the free trial (an on/off that
 * goes on top of the cycle, with its length shown only while it's on) and how often it
 * charges ("every N days / weeks / months / years").
 * It lives inside the sheet, so its typing state starts fresh every time the sheet opens.
 */
const BillingCyclePicker = ({
  cycle,
  trialDays,
  allowOneTime,
  onChange,
  onTrialChange,
}: Props) => {
  const reduceMotion = useReducedMotion()
  const hasTrial = trialDays !== undefined
  const isOneTime = cycle.type === 'one-time'

  // The text can be empty or invalid for a moment while typing, so it is kept apart
  const [trialText, setTrialText] = useState(String(trialDays ?? DEFAULT_TRIAL_DAYS))
  const [intervalText, setIntervalText] = useState(
    cycle.type === 'every' ? String(cycle.interval) : '1',
  )
  const [unit, setUnit] = useState<BillingUnit>(
    cycle.type === 'every' ? cycle.unit : 'month',
  )

  const changeTrial = (text = trialText) => {
    setTrialText(text)
    const days = parsePositive(text)
    if (days !== null) onTrialChange(days)
  }

  const toggleTrial = (on: boolean) => (on ? changeTrial() : onTrialChange(undefined))

  // The − / + buttons: never below 1, and a half-typed value counts as the default
  const stepTrial = (by: number) =>
    changeTrial(
      String(Math.max(1, (parsePositive(trialText) ?? DEFAULT_TRIAL_DAYS) + by)),
    )

  const selectEvery = (text = intervalText, nextUnit = unit) => {
    const interval = parsePositive(text)
    if (interval !== null) onChange({ type: 'every', interval, unit: nextUnit })
  }

  return (
    <div className={list}>
      <section className={group}>
        <Typography variant="label" size="sm" className={caption}>
          Prueba gratis
        </Typography>
        <div className={card}>
          <div className={row}>
            {/* Tapping anywhere on the row toggles it; the Switch is what screen readers get */}
            <button
              type="button"
              className={rowButton}
              tabIndex={-1}
              aria-hidden
              onClick={() => toggleTrial(!hasTrial)}
            />
            <Typography variant="body" size="md">
              Período de prueba
            </Typography>
            <Switch checked={hasTrial} onChange={toggleTrial} label="Período de prueba" />
          </div>
          <AnimatePresence initial={false}>
            {hasTrial && (
              <motion.div
                key="trial-length"
                className={collapse}
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.25, ease: 'easeInOut' }}
              >
                <div className={subRow}>
                  <Typography variant="body" size="md">
                    Duración
                  </Typography>
                  <div className={stepper}>
                    <IconButton label="Un día menos" onClick={() => stepTrial(-1)}>
                      <IconMinus />
                    </IconButton>
                    <InputNumber
                      size="medium"
                      width="auto"
                      maxLength={3}
                      aria-label="Días de prueba"
                      value={trialText}
                      errorMessage={
                        parsePositive(trialText) === null ? 'Mínimo 1' : undefined
                      }
                      onChange={(event) => changeTrial(event.currentTarget.value)}
                    />
                    <IconButton label="Un día más" onClick={() => stepTrial(1)}>
                      <IconAdd />
                    </IconButton>
                    <Typography variant="body" size="md">
                      {trialText === '1' ? 'día' : 'días'}
                    </Typography>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <section className={group}>
        <Typography variant="label" size="sm" className={caption}>
          Cómo se cobra
        </Typography>
        {/* Only for an old one-time subscription: the two cards are then a pick-one */}
        {allowOneTime && (
          <button
            type="button"
            className={cn(card, row, isOneTime && selected)}
            aria-pressed={isOneTime}
            onClick={() => onChange({ type: 'one-time' })}
          >
            <Typography variant="body" size="md">
              Pago único
            </Typography>
          </button>
        )}
        <div className={cn(card, allowOneTime && !isOneTime && selected)}>
          <div className={row}>
            <Typography variant="body" size="md">
              Cada
            </Typography>
            <InputNumber
              size="medium"
              width="auto"
              maxLength={3}
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
          </div>
          <div className={units} role="group" aria-label="Unidad de tiempo">
            {UNITS.map((option) => (
              <Pill
                key={option.value}
                isActive={!isOneTime && unit === option.value}
                layoutId="billingUnit"
                aria-pressed={!isOneTime && unit === option.value}
                onClick={() => {
                  setUnit(option.value)
                  selectEvery(intervalText, option.value)
                }}
              >
                {option.label}
              </Pill>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default BillingCyclePicker
