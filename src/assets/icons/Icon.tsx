// TYPES
import type { SVGProps } from 'react'

/** Any `<svg>` attribute: `className`, `width`, `strokeWidth`... */
export type IconProps = SVGProps<SVGSVGElement>

/**
 * The base every `Icon*` is built on: 24px grid, 2px round stroke, colored by
 * `currentColor` (the text color around it), hidden from screen readers (the button
 * around it carries the label). Any of it can be overridden through props.
 *
 * @example
 * export const IconArrow = (props: IconProps) => (
 *   <Icon {...props}>
 *     <path d="m15 18-6-6 6-6" />
 *   </Icon>
 * )
 */
const Icon = ({ children, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    {children}
  </svg>
)

export default Icon
