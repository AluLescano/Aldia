import type { ChangeEvent, InputHTMLAttributes } from 'react'

// HOOKS
import { useFieldIds } from '@/shared/hooks/useFieldIds'

// ANIMATIONS
import { useShake } from '@/shared/hooks/useShake'

//COMPONENTS
import Field from '../Field/Field'

// ASSETS
import styles from './InputNumber.module.scss'

// Digits with at most one "," or "." separator and two decimals
const NUMBER_TYPING_PATTERN = /^\d*$/

interface Props extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'width' | 'value' | 'onChange'
> {
  id?: string
  label?: string
  value: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  suffix?: string
  size?: 'large' | 'medium'
  width?: 'full' | 'fit'
  subText?: string
  errorMessage?: string
}

const InputNumber = ({
  id,
  label,
  value,
  onChange,
  suffix,
  size = 'large',
  width = 'full',
  subText,
  errorMessage,
  ...rest
}: Props) => {
  const { container } = styles

  const filled = Boolean(value)
  const { fieldId, describedBy } = useFieldIds({ id, errorMessage, subText })

  const boxRef = useShake<HTMLDivElement>(Boolean(errorMessage))

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (NUMBER_TYPING_PATTERN.test(event.target.value)) onChange(event)
  }

  return (
    <Field
      id={fieldId}
      label={label}
      size={size}
      width={width}
      filled={filled}
      subText={subText}
      errorMessage={errorMessage}
      ref={boxRef}
      disabled={rest.disabled}
      styles={rest.style}
    >
      <input
        {...rest}
        id={fieldId}
        type="text"
        inputMode="numeric"
        value={value}
        onChange={handleChange}
        className={container}
        aria-invalid={!!errorMessage || undefined}
        aria-describedby={describedBy}
      />
      <label htmlFor={fieldId}>{suffix}</label>
    </Field>
  )
}

export default InputNumber
