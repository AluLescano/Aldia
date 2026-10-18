// DEPENDENCIES
import { type CSSProperties, useState } from 'react'

// UTILS
import { ICONS } from '@/shared/lib/icons'
import { cn } from '@/shared/lib/cn'

// TYPES
import type { IconKey } from '@/shared/types'

// ASSETS
import { IconQuestion } from '@/assets/icons/IconQuestion'

import styles from './Avatar.module.scss'

const { base, image, sizeMedium, sizeLarge, fallback } = styles

interface Props {
  /** Logo image. If missing or broken, the avatar falls back to `iconKey`, then to the initial. */
  src?: string
  /** Built-in bill icon, used when there is no logo. */
  iconKey?: IconKey
  /** Its first letter is the last fallback ("?" icon if the name is empty). */
  name: string
  /** `medium` 2.5rem (lists), `large` 6rem (form header). */
  size?: 'medium' | 'large'
  /** Extra classes on the circle. */
  className?: string
}

const sizeClasses = {
  medium: sizeMedium,
  large: sizeLarge,
}

/**
 * A round logo with a soft glow of its own colors behind it (CSS, from the same image).
 * Falls back in order: logo → built-in icon → first letter → "?".
 */
const Avatar = ({ src, iconKey, name, size = 'medium', className }: Props) => {
  // Remember WHICH src failed, so a new src gets a fresh try without an effect
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const classes = cn(base, sizeClasses[size], className)

  if (src && failedSrc !== src) {
    return (
      <div className={classes} style={{ '--avatar': `url("${src}")` } as CSSProperties}>
        <img src={src} alt="" className={image} onError={() => setFailedSrc(src)} />
      </div>
    )
  }

  const Icon = iconKey ? ICONS[iconKey] : null
  const letter = name.trim().charAt(0).toUpperCase()

  return (
    <div className={cn(classes, fallback)} aria-hidden="true">
      {Icon ? <Icon /> : letter || <IconQuestion />}
    </div>
  )
}

export default Avatar
