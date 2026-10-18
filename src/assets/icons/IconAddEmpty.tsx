import Icon, { type IconProps } from './Icon'

/** Plus in a circle: the empty state of the subscription list. */
export const IconAddEmpty = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v8M8 12h8" />
  </Icon>
)
