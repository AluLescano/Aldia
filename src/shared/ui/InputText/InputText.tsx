import type { ChangeEvent, InputHTMLAttributes } from 'react'

// HOOKS
import { useFieldIds } from '@/shared/hooks/useFieldIds'

// ANIMATIONS
import { useShake } from '@/shared/hooks/useShake'

//COMPONENTS
import Field from '../Field/Field'

// ASSETS
import styles from './InputText.module.scss'

interface Props extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'width' | 'value' | 'onChange'
> {
  id?: string
  label?: string
  value: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
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
  const { fieldId, describedBy } = useFieldIds({ id, errorMessage, subText })

  const boxRef = useShake<HTMLDivElement>(Boolean(errorMessage))

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
    >
      <input
        {...rest}
        id={fieldId}
        type="text"
        value={value}
        onChange={onChange}
        className={container}
        aria-invalid={!!errorMessage || undefined}
        aria-describedby={describedBy}
      />
    </Field>
  )
}

export default InputText
