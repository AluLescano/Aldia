import { useId, type ChangeEvent, type InputHTMLAttributes } from 'react'

//COMPONENTS
import Field from '../Field/Field'

// ASSETS
import styles from './InputAmount.module.scss'
import { useShake } from '@/shared/hooks/useShake'

// Digits with at most one "," or "." separator and two decimals
const AMOUNT_TYPING_PATTERN = /^\d*[.,]?\d{0,2}$/

interface Props extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'width' | 'value' | 'onChange'
> {
  id?: string
  label: string
  value: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  currencySymbol?: string
  size?: 'large' | 'medium'
  width?: 'full' | 'fit'
  subText?: string
  errorMessage?: string
}

const InputAmount = ({
  id,
  label,
  value,
  onChange,
  size = 'medium',
  width = 'full',
  subText,
  currencySymbol = '$',
  errorMessage,
  ...rest
}: Props) => {
  const { container } = styles

  const filled = Boolean(value)
  const generatedId = useId()
  const fieldId = id ?? generatedId

  const boxRef = useShake<HTMLDivElement>(Boolean(errorMessage))

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (AMOUNT_TYPING_PATTERN.test(event.target.value)) onChange(event)
  }

  return (
    <Field
      id={fieldId}
      label={label}
      size={size}
      width={width}
      filled={filled}
      startAdornment={currencySymbol}
      subText={subText}
      errorMessage={errorMessage}
      ref={boxRef}
      disabled={rest.disabled}
    >
      <input
        {...rest}
        id={fieldId}
        type="text"
        inputMode="decimal"
        value={value}
        onChange={handleChange}
        className={container}
        aria-invalid={!!errorMessage || undefined}
        aria-describedby={errorMessage || subText ? `${fieldId}-description` : undefined}
      />
    </Field>
  )
}

export default InputAmount
