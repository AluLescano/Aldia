// TYPES
import type { ComponentType } from 'react'
import type { IconKey } from '@/shared/types'
import type { IconProps } from '@/assets/icons/Icon'

// ASSETS
import { IconBuilding } from '@/assets/icons/IconBuilding'
import { IconPhone } from '@/assets/icons/IconPhone'
import { IconFlame } from '@/assets/icons/IconFlame'
import { IconDrop } from '@/assets/icons/IconDrop'
import { IconBolt } from '@/assets/icons/IconBolt'
import { IconWifi } from '@/assets/icons/IconWifi'

/**
 * The built-in icon for each kind of bill (presets with no logo, like "Electricidad").
 *
 * @example
 * const Icon = ICONS[subscription.iconKey]
 * return <Icon />
 */
export const ICONS: Record<IconKey, ComponentType<IconProps>> = {
  electricity: IconBolt,
  water: IconDrop,
  gas: IconFlame,
  phone: IconPhone,
  rent: IconBuilding,
  internet: IconWifi,
}
