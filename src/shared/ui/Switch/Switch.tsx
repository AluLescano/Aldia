import styles from './Switch.module.scss'

interface Props {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string // accessible name: the switch has no visible text
  disabled?: boolean
}

const { track, on, knob } = styles

const Switch = ({ checked, onChange, label, disabled }: Props) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    className={[track, checked && on].filter(Boolean).join(' ')}
    onClick={() => onChange(!checked)}
  >
    <span className={knob} />
  </button>
)

export default Switch
