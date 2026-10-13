import { useState } from 'react'

import styles from './Avatar.module.scss'

const { base, sizeMedium, sizeLarge, fallback } = styles

interface Props {
  src?: string
  name: string
  size?: 'medium' | 'large'
  className?: string
}

const sizeClasses = {
  medium: sizeMedium,
  large: sizeLarge,
}

const Avatar = ({ src, name, size = 'medium', className }: Props) => {
  // Remember WHICH src failed, so a new src gets a fresh try without an effect
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const showImage = Boolean(src) && failedSrc !== src

  const classes = [base, sizeClasses[size], className].filter(Boolean).join(' ')

  if (showImage) {
    return <img src={src} alt="" className={classes} onError={() => setFailedSrc(src ?? null)} />
  }

  return (
    <div className={`${classes} ${fallback}`} aria-hidden="true">
      {name.trim().charAt(0).toUpperCase()}
    </div>
  )
}

export default Avatar