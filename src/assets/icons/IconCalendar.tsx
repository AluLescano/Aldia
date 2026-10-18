import Icon, { type IconProps } from './Icon'

/** Calendar: the Calendario tab, its page and the date fields. */
export const IconCalendar = (props: IconProps) => (
  <Icon {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </Icon>
)
