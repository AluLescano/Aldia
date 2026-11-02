// UTILS
import { cn } from '@/shared/lib/cn'

import styles from './AppLogo.module.scss'

interface Props {
  /** Width and height of the mark in px. Defaults to 24. */
  size?: number
  className?: string
}

/**
 * The Aldia logo: the mark (the "a" with the clock) drawn in one color (`currentColor`,
 * set by the styles), read as "Aldia". Where it sits is up to the parent.
 * Master in `docs/brand/logo/aldia-mark-mono.svg`.
 */
const AppLogo = ({ size = 24, className }: Props) => {
  const { logo } = styles
  return (
    <div className={cn(logo, className)} role="img" aria-label="Aldia">
      <svg
        width={size}
        height={size}
        viewBox="27 29 46 46"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M46.9 34.3A18 18 0 1 1 32 52"
          stroke="currentColor"
          strokeWidth={9}
          strokeLinecap="round"
        />
        <circle cx="36.2" cy="40.4" r="4.5" fill="currentColor" />
        <path
          d="M50 52V43.5M50 52H43.5"
          stroke="currentColor"
          strokeWidth={3.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="63.5" y="30" width="9" height="44.5" rx="4.5" fill="currentColor" />
      </svg>
    </div>
  )
}

export default AppLogo
