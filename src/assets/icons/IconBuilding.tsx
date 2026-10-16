import Icon, { type IconProps } from './Icon'

export const IconBuilding = (props: IconProps) => (
  <Icon {...props}>
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <path d="M9 7h.01M15 7h.01M9 11h.01M15 11h.01M10 21v-4h4v4" />
  </Icon>
)
