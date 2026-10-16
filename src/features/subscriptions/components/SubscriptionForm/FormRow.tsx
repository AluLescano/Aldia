import type { ReactNode } from 'react'

// COMPONENTS
import Typography from '@/shared/ui/Typography/Typography'

// ASSETS
import styles from './SubscriptionForm.module.scss'

interface Props {
  /** Text on the left of the row, e.g. "Monto". */
  label: string
  /** The control on the right: an `Input*` with `size="medium"`, a `Switch` or a button. */
  children: ReactNode
}

/**
 * One row of the subscription form: label on the left, control on the right.
 * Uses the form's own `inputContainer` class, so it only looks right inside the form cards.
 */
const FormRow = ({ label, children }: Props) => {
  const { inputContainer } = styles

  return (
    <div className={inputContainer}>
      <Typography variant="body" size="medium">
        {label}
      </Typography>
      {children}
    </div>
  )
}

export default FormRow
