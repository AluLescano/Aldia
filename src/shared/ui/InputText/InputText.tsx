import { useId, type ChangeEvent, type InputHTMLAttributes } from 'react'

//COMPONENTS
import Field from '../Field/Field'

// ASSETS
import styles from './InputText.module.scss'

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

const InputText = ({
  id,
  label,
  value,
  onChange,
  size = 'medium',
  width = 'full',
  subText,
  errorMessage,
  ...rest
}: Props) => {
  const { container } = styles

  const filled = Boolean(value)
  const generatedId = useId()
  const fieldId = id ?? generatedId

  return (
    <Field
      id={fieldId}
      label={label}
      size={size}
      width={width}
      filled={filled}
      subText={subText}
      errorMessage={errorMessage}
      disabled={rest.disabled}
    >
      <input
        {...rest}
        id={fieldId}
        type="text"
        value={value}
        onChange={onChange}
        className={container}
        aria-invalid={!!errorMessage || undefined}
        aria-describedby={errorMessage || subText ? `${fieldId}-description` : undefined}
      />
    </Field>
  )
}

export default InputText
