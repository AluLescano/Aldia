import type { ComponentType } from 'react'
import type { IconKey } from '../types'
import type { IconProps } from '@/assets/icons/Icon'
import { IconBuilding } from '@/assets/icons/IconBuilding'
import { IconPhone } from '@/assets/icons/IconPhone'
import { IconFlame } from '@/assets/icons/IconFlame'
import { IconDrop } from '@/assets/icons/IconDrop'
import { IconBolt } from '@/assets/icons/IconBolt'
import { IconWifi } from '@/assets/icons/IconWifi'

export const ICONS: Record<IconKey, ComponentType<IconProps>> = {
  electricity: IconBolt,
  water: IconDrop,
  gas: IconFlame,
  phone: IconPhone,
  rent: IconBuilding,
  internet: IconWifi,
}
