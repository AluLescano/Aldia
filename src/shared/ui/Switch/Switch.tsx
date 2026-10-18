// UTILS
import { cn } from '@/shared/lib/cn'
import { useFieldRow } from '../Field/FieldRowContext'

// ASSETS
import styles from './Switch.module.scss'

interface Props {
  checked: boolean
  /** Called with the new value on every tap. */
  onChange: (checked: boolean) => void
  /** Read by screen readers: the switch has no visible text (e.g. "Tiene fecha de fin"). */
  label: string
  disabled?: boolean
}

const { track, on, knob } = styles

/**
 * An on/off toggle (a `<button role="switch">`, so it's announced as a switch).
 * Inside a row with `FieldRowContext` it takes the row's id, so tapping the row's label toggles it.
 */
const Switch = ({ checked, onChange, label, disabled }: Props) => {
  const row = useFieldRow()

  return (
    <button
      id={row?.controlId}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className={cn(track, checked && on)}
      onClick={() => onChange(!checked)}
    >
      <span className={knob} />
    </button>
  )
}

export default Switch
