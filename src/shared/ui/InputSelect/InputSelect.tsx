import type { ButtonHTMLAttributes } from 'react'

// HOOKS
import { useFieldControl, type FieldControlProps } from '@/shared/hooks/useFieldControl'

// COMPONENTS
import Field from '../Field/Field'

// ASSETS
import styles from './InputSelect.module.scss'

interface Props
  extends
    FieldControlProps,
    Omit<
      ButtonHTMLAttributes<HTMLButtonElement>,
      keyof FieldControlProps | 'value' | 'onChange'
    > {
  /** The text to show for the chosen option (a label like "Mensual", not an id). */
  value: string
  /** Shown while `value` is empty. */
  placeholder: string
  /** Opens the picker, usually a bottom sheet. This component never changes `value` itself. */
  onClick: () => void
}

/**
 * Select-looking button: shows the current choice and opens a picker on tap.
 * The parent owns the sheet and updates `value` when something is picked.
 */
const InputSelect = ({
  id,
  label,
  placeholder,
  value,
  onClick,
  size,
  width,
  minWidth,
  subText,
  errorMessage,
  ...rest
}: Props) => {
  const { container } = styles

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
    <Field {...fieldProps}>
      <button
        {...rest}
        {...controlProps}
        aria-labelledby={buttonLabelledBy ?? rest['aria-labelledby']}
        type="button"
        onClick={onClick}
        className={container}
        aria-haspopup="dialog"
      >
        {value || placeholder}
      </button>
    </Field>
  )
}

export default InputSelect
