import type { ButtonHTMLAttributes } from 'react'

// HOOKS
import { useFieldIds } from '@/shared/hooks/useFieldIds'
import { formatDate } from '@/shared/lib/formatDate'

// ANIMATIONS
import { useShake } from '@/shared/hooks/useShake'

//COMPONENTS
import Field from '../Field/Field'

// ASSETS
import { IconCalendar } from '@/assets/icons/IconCalendar'

import styles from './InputDate.module.scss'

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

const InputDate = ({
  id,
  label,
  placeholder,
  value,
  onClick,
  size = 'large',
  width = 'full',
  subText,
  errorMessage,
  ...rest
}: Props) => {
  const { container, calendarIcon } = styles

  const filled = Boolean(value)
  const { fieldId, describedBy } = useFieldIds({ id, errorMessage, subText })

  const boxRef = useShake<HTMLDivElement>(Boolean(errorMessage))

  return (
    <Field
      id={fieldId}
      size={size}
      width={width}
      label={label}
      filled={filled}
      startAdornment={<IconCalendar className={calendarIcon}/>}
      subText={subText}
      errorMessage={errorMessage}
      ref={boxRef}
      disabled={rest.disabled}
    >
      <button
        id={fieldId}
        type="button"
        onClick={onClick}
        className={container}
        disabled={rest.disabled}
        aria-haspopup="dialog"
        aria-invalid={!!errorMessage || undefined}
        aria-describedby={describedBy}
      >
        {formatDate(value) || placeholder}
      </button>
    </Field>
  )
}

export default InputDate
