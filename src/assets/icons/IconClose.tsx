import Icon, { type IconProps } from './Icon'

/** X: the close button of the toast. */
export const IconClose = (props: IconProps) => (
  <Icon {...props}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </Icon>
)
