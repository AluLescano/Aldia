import { useId, useMemo, useState, type ReactNode } from 'react'

// COMPONENTS
import Typography from '@/shared/ui/Typography/Typography'
import { FieldRowContext, type FieldRow } from '@/shared/ui/Field/FieldRowContext'

// ASSETS
import styles from './SubscriptionForm.module.scss'

interface Props {
  /** Text on the left of the row, e.g. "Monto". A real `<label>` for the control. */
  label: string
  /** The control on the right: an `Input*` with `size="medium"`, a `Switch` or a button. */
  children: ReactNode
  /**
   * Id of the control, for controls that don't read the row context themselves
   * (like a plain `Button`): pass the same id to the control. `Input*` and `Switch` don't need it.
   */
  controlId?: string
}

/**
 * One row of the subscription form: label on the left, control on the right, and
 * the control's hint or error underneath, across the whole row.
 * Shares the label and message slot with the control through `FieldRowContext`.
 * Uses the form's own `inputContainer` class, so it only looks right inside the form cards.
 */
const FormRow = ({ label, children, controlId }: Props) => {
  const { inputContainer, rowLabel, messageSlot: messageSlotClass } = styles
  const generatedId = useId()
  const labelId = `${generatedId}-label`

  // State, not a ref: Field has to re-render once the slot exists to send its message there
  const [messageSlot, setMessageSlot] = useState<HTMLDivElement | null>(null)

  const row = useMemo<FieldRow>(
    () => ({ controlId: controlId ?? `${generatedId}-control`, labelId, messageSlot }),
    [controlId, generatedId, labelId, messageSlot],
  )

  return (
    <FieldRowContext.Provider value={row}>
      <div className={inputContainer}>
        <label id={labelId} htmlFor={row.controlId} className={rowLabel}>
          <Typography variant="label" size="md">
            {label}
          </Typography>
        </label>
        {children}
        <div ref={setMessageSlot} className={messageSlotClass} />
      </div>
    </FieldRowContext.Provider>
  )
}

export default FormRow
