import Icon, { type IconProps } from './Icon'

/** Check mark on its own: a badge that says "done" or "safe". */
export const IconCheck = (props: IconProps) => (
  <Icon {...props}>
    <path d="M20 6 9 17l-5-5" />
  </Icon>
)
