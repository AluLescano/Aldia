import type { ButtonHTMLAttributes } from 'react'

// HOOKS
import { useFieldControl, type FieldControlProps } from '@/shared/hooks/useFieldControl'

// UTILS
import { formatDate } from '@/shared/lib/formatDate'

// COMPONENTS
import Field from '../Field/Field'

// ASSETS
import { IconCalendar } from '@/assets/icons/IconCalendar'

import styles from './InputDate.module.scss'

interface Props
  extends
    FieldControlProps,
    Omit<
      ButtonHTMLAttributes<HTMLButtonElement>,
      keyof FieldControlProps | 'value' | 'onChange'
    > {
  /** The date as `YYYY-MM-DD`. Shown as "15 Oct 26". Empty shows nothing. */
  value: string
  /** Opens the date picker sheet. This component never changes `value` itself. */
  onClick: () => void
}

/** Date-looking button with a calendar icon: shows the date and opens a picker on tap. */
const InputDate = ({
  id,
  label,
  value,
  onClick,
  size,
  width,
  minWidth,
  subText,
  errorMessage,
  ...rest
}: Props) => {
  const { container, calendarIcon } = styles

  const { fieldProps, controlProps, buttonLabelledBy } = useFieldControl({
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

  return (
    <Field {...fieldProps} startAdornment={<IconCalendar className={calendarIcon} />}>
      <button
        {...rest}
        {...controlProps}
        aria-labelledby={buttonLabelledBy ?? rest['aria-labelledby']}
        type="button"
        onClick={onClick}
        className={container}
        aria-haspopup="dialog"
      >
        {formatDate(value)}
      </button>
    </Field>
  )
}

export default InputDate
