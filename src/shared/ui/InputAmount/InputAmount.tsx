import type { ChangeEvent, InputHTMLAttributes } from 'react'

// HOOKS
import { useFieldControl, type FieldControlProps } from '@/shared/hooks/useFieldControl'

// UTILS
import { cn } from '@/shared/lib/cn'

// COMPONENTS
import Field from '../Field/Field'
import Typography from '../Typography/Typography'

// ASSETS
import styles from './InputAmount.module.scss'

// Digits with at most one "," or "." separator and two decimals
const AMOUNT_TYPING_PATTERN = /^\d*[.,]?\d{0,2}$/

// The typed text as a number for the pretty copy ("1299,5" -> 1299.5 -> "1.299,50").
// Empty shows 0 (the placeholder look); a lone separator stays as typed.
const toDisplayAmount = (value: string): number | string => {
  if (value === '') return 0
  const amount = Number(value.replace(',', '.'))
  return Number.isNaN(amount) ? value : amount
}

interface Props
  extends
    FieldControlProps,
    Omit<
      InputHTMLAttributes<HTMLInputElement>,
      keyof FieldControlProps | 'value' | 'onChange'
    > {
  /** The amount as typed, e.g. `"1299,5"`. Turn it into a number with `parsePrice`. */
  value: string
  /** Shown at the left of the box. Defaults to `$`. */
  currencySymbol?: string
  /** Only called when the new text still looks like an amount (2 decimals at most). */
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
}

/**
 * Money field: decimal keyboard, currency symbol on the left. Keys that would break
 * the amount (letters, a second separator, a third decimal) are ignored silently.
 *
 * While the field isn't being edited it shows the amount in the `currency` Typography
 * look (thousands dots, raised decimals), drawn over the real input. Once the user
 * types, the plain input shows instead, so the caret always matches the text.
 */
const InputAmount = ({
  id,
  label,
  value,
  onChange,
  size,
  width,
  minWidth,
  subText,
  currencySymbol = '$',
  errorMessage,
  ...rest
}: Props) => {
  const { stack, input, display, empty } = styles

  const { fieldProps, controlProps } = useFieldControl({
    id,
    label,
    size,
    width,
    minWidth,
    subText,
    errorMessage,
    disabled: rest.disabled,
    filled: value !== '',
  })

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (AMOUNT_TYPING_PATTERN.test(event.target.value)) onChange(event)
  }

  return (
    <Field {...fieldProps} startAdornment={currencySymbol}>
      {/* The input and its pretty copy share one grid cell, so the box fits the wider one */}
      <div className={stack}>
        <input
          {...rest}
          {...controlProps}
          type="text"
          inputMode="decimal"
          placeholder="0.00"
          value={value}
          onChange={handleChange}
          className={input}
        />
        {/* Hidden from screen readers: the input already holds the real value */}
        <div className={cn(display, value === '' && empty)} aria-hidden="true">
          <Typography variant="currency" size="md" currencySymbol="">
            {toDisplayAmount(value)}
          </Typography>
        </div>
      </div>
    </Field>
  )
}

export default InputAmount
