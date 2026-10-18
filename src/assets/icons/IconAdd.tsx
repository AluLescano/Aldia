import Icon, { type IconProps } from './Icon'

/** Plus sign: the Home add button and the custom subscription button of the picker. */
export const IconAdd = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
)
