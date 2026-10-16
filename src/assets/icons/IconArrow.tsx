import Icon, { type IconProps } from './Icon'

// Points left; rotate it with CSS (transform: rotate()) for the other directions
export const IconArrow = (props: IconProps) => (
  <Icon {...props}>
    <path d="m15 18-6-6 6-6" />
  </Icon>
)
