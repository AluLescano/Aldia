import Icon, { type IconProps } from './Icon'

/** Calendar with a clock: sort by next charge. */
export const IconCalendarClock = (props: IconProps) => (
  <Icon {...props}>
    <path d="M16 14v2.2l1.6 1M16 2v4M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5M3 10h5M8 2v4" />
    <circle cx="16" cy="16" r="6" />
  </Icon>
)
