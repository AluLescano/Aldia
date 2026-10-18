import { useId } from 'react'

import { useShake } from './useShake'
import type { FieldSize, FieldWidth } from '@/shared/ui/Field/Field'

/** Props every input built on `Field` shares. */
export interface FieldControlProps {
  /** Id for the control. Leave it out and one is generated with `useId`. */
  id?: string
  /** Floating label. Only `size="large"` shows it: medium rows have their label outside, in the row. */
  label?: string
  /**
   * - `large`: Figma "Default", 56px tall, floating label.
   * - `medium`: Figma "Small", 42px chip, no label.
   */
  size?: FieldSize
  /**
   * - `full`: fills the row.
   * - `fit`: grows with the content, at least 9rem (or `minWidth`).
   * - `auto`: grows with the content, no minimum, 1rem padding on each side.
   */
  width?: FieldWidth
  /**
   * Smallest width of the box, as a CSS length (`'5rem'`, `'0'`). Only works with
   * `width="fit"`, where it replaces the 9rem default.
   */
  minWidth?: string
  /** Hint under the box. Hidden while there is an error. */
  subText?: string
  /** Error under the box. Turns the border red, sets `aria-invalid` and shakes the box once. */
  errorMessage?: string
}

interface Options extends FieldControlProps {
  disabled?: boolean
  /** True when the control shows a value, so the floating label moves up onto the border. */
  filled: boolean
}

/**
 * Wires an input to its `Field` box: one id for both, the link between the
 * control and its hint or error (for screen readers), and the shake on error.
 *
 * @returns `fieldProps` to spread on `<Field>`, and `controlProps` to spread on the
 * real `<input>` or `<button>`. Spread `controlProps` after `...rest` so they always win.
 *
 * @example
 * const { fieldProps, controlProps } = useFieldControl({ id, label, errorMessage, filled: value !== '' })
 * return (
 *   <Field {...fieldProps}>
 *     <input {...rest} {...controlProps} value={value} onChange={onChange} />
 *   </Field>
 * )
 */
export function useFieldControl({
  id,
  label,
  size = 'large',
  width = 'full',
  minWidth,
  subText,
  errorMessage,
  disabled,
  filled,
}: Options) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const hasError = Boolean(errorMessage)

  // Field only renders the description when there is a hint or an error,
  // so the control may only point at it in that case
  const descriptionId = errorMessage || subText ? `${fieldId}-description` : undefined

  const shakeRef = useShake<HTMLDivElement>(hasError)

  return {
    fieldProps: {
      id: fieldId,
      label,
      size,
      width,
      minWidth,
      subText,
      errorMessage,
      disabled,
      filled,
      descriptionId,
      ref: shakeRef,
    },
    controlProps: {
      id: fieldId,
      disabled,
      'aria-invalid': hasError || undefined,
      'aria-describedby': descriptionId,
    },
  }
}
