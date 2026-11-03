import Icon, { type IconProps } from './Icon'

/** Down arrow with 0 over 1: sort by price, cheapest first. */
export const IconSort01 = (props: IconProps) => (
  <Icon {...props}>
    <path d="m3 16 4 4 4-4M7 20V4M17 20v-6h-2M15 20h4" />
    <rect x="15" y="4" width="4" height="6" ry="2" />
  </Icon>
)
