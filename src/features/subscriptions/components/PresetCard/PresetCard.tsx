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
  /** Shown under the logo, in up to 2 lines (then "…"). Also the button's accessible name. */
  name: string
  /** Logo path; presets without one use `iconKey`. */
  logo?: string
  /** Icon for presets with no logo (bills like "Gas" or "Internet"). */
  iconKey?: IconKey
  /** Called when the card is tapped, usually to open the form with this preset. */
  onClick: () => void
  /** Extra classes on top of the card look. */
  className?: string
}

/**
 * One tile of the preset picker grid: logo (or bill icon) and name, in a square card.
 * The name always takes a 2-line box, so every logo in a row sits at the same height.
 * The press shrink and tint come from `Button`; the logo grows on hover only with a mouse.
 *
 * @example
 * <PresetCard name="Netflix" logo={netflixLogo} onClick={() => pickPreset(netflix)} />
 */
const PresetCard = ({ name, logo, iconKey, onClick, className }: Props) => {
  const { container, logo: logoClass, icon, name: nameClass } = styles
  const Icon = iconKey ? ICONS[iconKey] : null

  return (
    <Button onClick={onClick} className={cn(container, className)}>
      {logo && <img src={logo} alt="" className={logoClass} />}
      {Icon && <Icon className={icon} />}
      <Typography variant="body" size="sm" className={nameClass}>
        {name}
      </Typography>
    </Button>
  )
}

export default PresetCard
