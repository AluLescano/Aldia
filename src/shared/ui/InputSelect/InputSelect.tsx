import type {ButtonHTMLAttributes } from 'react'

// HOOKS
import { useFieldIds } from '@/shared/hooks/useFieldIds'

// ANIMATIONS
import { useShake } from '@/shared/hooks/useShake'

//COMPONENTS
import Field from '../Field/Field'

// ASSETS
import styles from './InputSelect.module.scss'


interface Props extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'size' | 'width' | 'value' | 'onChange'
> {
  id?: string
  label?: string
  placeholder: string
  value: string
  onClick: () => void
  size?: 'large' | 'medium'
  width?: 'full' | 'fit'
  subText?: string
  errorMessage?: string
}

const InputSelect = ({
  id,
  label,
  placeholder,
  value,
  onClick,
  size = "large",
  width = "full",
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
      styles={rest.style}
    >
      <button
        id={fieldId}
        type="button"
        onClick={onClick}
        className={container}
        aria-haspopup="dialog"
        aria-invalid={!!errorMessage || undefined}
        aria-describedby={describedBy}
      >
        {value || placeholder}
      </button>
    </Field>
  )
}

export default InputSelect
