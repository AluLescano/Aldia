// UTILS
import { ICONS } from '@/shared/lib/icons'
import { cn } from '@/shared/lib/cn'

// COMPONENTS
import Typography from '@/shared/ui/Typography/Typography'
import Button from '@/shared/ui/Button/Button'

// TYPES
import type { IconKey } from '@/shared/types'

// ASSETS
import styles from './PresetCard.module.scss'

interface Props {
  name: string
  /** Logo path; presets without one use `iconKey`. */
  logo?: string
  iconKey?: IconKey
  onClick: () => void
  className?: string
}

/** One tile of the preset picker grid: logo (or bill icon) and name. */
const PresetCard = ({ name, logo, iconKey, onClick, className }: Props) => {
  const { container, text } = styles
  const Icon = iconKey ? ICONS[iconKey] : null

  return (
    <Button onClick={onClick} className={cn(container, className)}>
      {logo && <img src={logo} alt="" />}
      {Icon && <Icon />}
      <div className={text}>
        <Typography variant="body" size="sm">
          {name}
        </Typography>
      </div>
    </Button>
  )
}

export default PresetCard
