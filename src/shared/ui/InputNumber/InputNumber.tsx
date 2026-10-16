import type { ChangeEvent, InputHTMLAttributes } from 'react'

// HOOKS
import { useFieldControl, type FieldControlProps } from '@/shared/hooks/useFieldControl'

// COMPONENTS
import Field from '../Field/Field'

// ASSETS
import styles from './InputNumber.module.scss'

// Digits only (no sign, no decimals)
const NUMBER_TYPING_PATTERN = /^\d*$/

interface Props
  extends
    FieldControlProps,
    Omit<
      InputHTMLAttributes<HTMLInputElement>,
      keyof FieldControlProps | 'value' | 'onChange'
    > {
  /** The number as typed. Empty while the user clears it, so check it before using it. */
  value: string
  /** Only called when the new text is digits only. */
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  /** Text after the number inside the box, e.g. `"días"`. Tapping it focuses the input. */
  suffix?: string
}

/** Whole-number field with the numeric keyboard. Anything but digits is ignored silently. */
const InputNumber = ({
  id,
  label,
  value,
  onChange,
  suffix,
  size,
  width,
  subText,
  errorMessage,
  ...rest
}: Props) => {
  const { container } = styles

  const { fieldProps, controlProps } = useFieldControl({
    id,
    label,
    size,
    width,
    subText,
    errorMessage,
    disabled: rest.disabled,
    filled: value !== '',
  })

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (NUMBER_TYPING_PATTERN.test(event.target.value)) onChange(event)
  }

  return (
    <Field {...fieldProps}>
      <input
        {...rest}
        {...controlProps}
        type="text"
        inputMode="numeric"
        value={value}
        onChange={handleChange}
        className={container}
      />
      {suffix && <label htmlFor={controlProps.id}>{suffix}</label>}
    </Field>
  )
}

export default InputNumber
