import Icon, { type IconProps } from './Icon'

/** Two opposite arrows: the sort button on the Home list. */
export const IconSort = (props: IconProps) => (
  <Icon {...props}>
    <path d="m21 16-4 4-4-4M17 20V4M3 8l4-4 4 4M7 4v16" />
  </Icon>
)
