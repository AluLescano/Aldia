// UTILS
import { parseInRange } from '@/shared/lib/parseInRange'

// COMPONENTS
import IconButton from '../IconButton/IconButton'
import InputNumber from '../InputNumber/InputNumber'

// ASSETS
import { IconAdd } from '@/assets/icons/IconAdd'
import { IconMinus } from '@/assets/icons/IconMinus'
import styles from './InputStepper.module.scss'

interface Props {
  /** The number as typed. Can be empty or out of range for a moment while typing. */
  value: string
  /** Called with the new text, from typing or from − / +. */
  onChange: (text: string) => void
  /** Smallest allowed number; − stops here. */
  min: number
  /** Largest allowed number; + stops here. No limit if left out. */
  max?: number
  /** What − / + count from while the text is empty or invalid. Defaults to `min`. */
  fallback?: number
  /** Read by screen readers for the number, e.g. "Días de prueba". */
  label: string
  /** The − button's label, e.g. "Un día menos". */
  decreaseLabel: string
  /** The + button's label, e.g. "Un día más". */
  increaseLabel: string
}

/**
 * A whole number with − and + buttons around it (tapping on a phone beats the keyboard for
 * small numbers), and still typeable. The parent keeps the text, like with `InputNumber`.
 *
 * @example
 * <InputStepper value={daysText} onChange={setDaysText} min={1} label="Días de prueba"
 *   decreaseLabel="Un día menos" increaseLabel="Un día más" />
 */
const InputStepper = ({
  value,
  onChange,
  min,
  max = Infinity,
  fallback = min,
  label,
  decreaseLabel,
  increaseLabel,
}: Props) => {
  const step = (by: number) => {
    const next = (parseInRange(value, min, max) ?? fallback) + by
    onChange(String(Math.min(max, Math.max(min, next))))
  }

  const isValid = parseInRange(value, min, max) !== null
  const errorMessage = isValid
    ? undefined
    : Number(value) > max
      ? `Máximo ${max}`
      : `Mínimo ${min}`

  return (
    <div className={styles.stepper}>
      <IconButton label={decreaseLabel} onClick={() => step(-1)}>
        <IconMinus />
      </IconButton>
      <InputNumber
        size="medium"
        width="auto"
        maxLength={3}
        aria-label={label}
        value={value}
        errorMessage={errorMessage}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
      <IconButton label={increaseLabel} onClick={() => step(1)}>
        <IconAdd />
      </IconButton>
    </div>
  )
}

export default InputStepper
