import type { SVGProps } from 'react'

export type IconProps = SVGProps<SVGSVGElement>

// Shared setup for every icon: 24px grid, 2px round stroke, colored by `currentColor`.
// Callers can override any of it (className, width, strokeWidth...) through props.
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
