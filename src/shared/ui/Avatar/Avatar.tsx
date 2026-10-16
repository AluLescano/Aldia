import { ICONS } from '@/shared/lib/icons'
import { cn } from '@/shared/lib/cn'

import { type CSSProperties, useState } from 'react'
import type { IconKey } from '@/shared/types'

import { IconQuestion } from '@/assets/icons/IconQuestion'

import styles from './Avatar.module.scss'

const { base, image, sizeMedium, sizeLarge, fallback } = styles

interface Props {
  src?: string
  iconKey?: IconKey
  name: string
  size?: 'medium' | 'large'
  className?: string
}

const sizeClasses = {
  medium: sizeMedium,
  large: sizeLarge,
}

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
