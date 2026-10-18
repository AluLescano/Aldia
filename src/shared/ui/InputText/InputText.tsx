import type { ChangeEvent, InputHTMLAttributes } from 'react'

// HOOKS
import { useFieldControl, type FieldControlProps } from '@/shared/hooks/useFieldControl'

// COMPONENTS
import Field from '../Field/Field'

// ASSETS
import styles from './InputText.module.scss'

interface Props
  extends
    FieldControlProps,
    Omit<
      InputHTMLAttributes<HTMLInputElement>,
      keyof FieldControlProps | 'value' | 'onChange'
    > {
  /** The text shown. The parent owns it (controlled input). */
  value: string
  /** Called on every key. Read the new text from `event.currentTarget.value`. */
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
}

/** Single-line text field on the shared `Field` box. Controlled: the parent owns `value`. */
const InputText = ({
  id,
  label,
  size,
  width,
  minWidth,
  subText,
  errorMessage,
  value,
  onChange,
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

  return (
    <Field {...fieldProps}>
      <input
        {...rest}
        {...controlProps}
        type="text"
        value={value}
        onChange={onChange}
        className={container}
      />
    </Field>
  )
}

export default InputText
