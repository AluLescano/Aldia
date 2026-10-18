import Icon, { type IconProps } from './Icon'

/** Two bars: pause a subscription (see `PauseToggleIcon`). */
export const IconPause = (props: IconProps) => (
  <Icon {...props}>
    <path d="M8 5v14M16 5v14" />
  </Icon>
)
