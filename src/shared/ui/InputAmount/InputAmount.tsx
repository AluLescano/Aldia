import type { ChangeEvent, CSSProperties, InputHTMLAttributes } from 'react'

// HOOKS
import { useFieldControl, type FieldControlProps } from '@/shared/hooks/useFieldControl'

// COMPONENTS
import Field from '../Field/Field'

// ASSETS
import styles from './InputAmount.module.scss'

// Digits with at most one "," or "." separator and two decimals
const AMOUNT_TYPING_PATTERN = /^\d*[.,]?\d{0,2}$/

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
  const { container } = styles

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
      <input
        {...rest}
        {...controlProps}
        type="text"
        inputMode="decimal"
        placeholder="0.00"
        value={value}
        onChange={handleChange}
        className={container}
        // A longer symbol ("U$S") needs more room on the left (see InputAmount.module.scss)
        style={
          { ...rest.style, '--symbol-chars': currencySymbol.length } as CSSProperties
        }
      />
    </Field>
  )
}

export default InputAmount
