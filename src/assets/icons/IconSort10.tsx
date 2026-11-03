import Icon, { type IconProps } from './Icon'

/** Up arrow with 0 over 1: sort by price, priciest first (the 0-1 icon, read upwards). */
export const IconSort10 = (props: IconProps) => (
  <Icon {...props}>
    <path d="m3 8 4-4 4 4M7 4v16M17 20v-6h-2M15 20h4" />
    <rect x="15" y="4" width="4" height="6" ry="2" />
  </Icon>
)
