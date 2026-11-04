import Icon, { type IconProps } from './Icon'

/** Up arrow with A over Z: sort by name, Z-A (the A-Z icon, read upwards). */
export const IconSortZA = (props: IconProps) => (
  <Icon {...props}>
    <path d="m3 8 4-4 4 4M7 4v16M20 8h-5M15 10V6.5a2.5 2.5 0 0 1 5 0V10M15 14h5l-5 6h5" />
  </Icon>
)
