// TYPE
import type { IconKey } from '@/shared/types'

// DATA
import { ICONS } from '@/shared/lib/icons'

// COMPONENTS
import Typography from '@/shared/ui/Typography/Typography'
import Button from '@/shared/ui/Button/Button'
import { cn } from '@/shared/lib/cn'

// ASSETS
import styles from './PresetCard.module.scss'

interface Props {
  name: string
  logo?: string
  iconKey?: IconKey
  onClick: () => void
  className?: string
}

const PresetCard = ({ name, logo, iconKey, onClick, className }: Props) => {
  const { container, text } = styles
  const Icon = iconKey ? ICONS[iconKey] : null

  return (
    <Button onClick={onClick} className={cn(container, className)}>
      {logo && <img src={logo} alt="" />}
      {Icon && <Icon />}
      <div className={text}>
        <Typography variant="body" size="small">
          {name}
        </Typography>
      </div>
    </Button>
  )
}

export default PresetCard
