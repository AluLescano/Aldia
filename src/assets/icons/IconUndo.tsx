import Icon, { type IconProps } from './Icon'

/** Curved arrow back: the "Deshacer" action of the delete toast. */
export const IconUndo = (props: IconProps) => (
  <Icon {...props}>
    <path d="M3 7v6h6" />
    <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
  </Icon>
)
