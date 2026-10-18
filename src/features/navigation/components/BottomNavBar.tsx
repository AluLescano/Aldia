// DEPENDENCIES
import type { ComponentType } from 'react'
import { motion } from 'motion/react'

// UTILS
import { cn } from '@/shared/lib/cn'

// COMPONENTS
import Typography from '@/shared/ui/Typography/Typography'

// TYPES
import type { TabType } from '@/shared/types'
import type { IconProps } from '@/assets/icons/Icon'

// ASSETS
import { IconHome } from '@/assets/icons/IconHome'
import { IconCalendar } from '@/assets/icons/IconCalendar'
import { IconChartPie } from '@/assets/icons/IconChartPie'
import { IconCreditCard } from '@/assets/icons/IconCreditCard'
import { IconSettings } from '@/assets/icons/IconSettings'

import styles from './BottomNavBar.module.scss'

const {
  navContainer,
  navWrapper,
  navItem,
  active,
  highlight,
  pill,
  icon,
  label: labelClass,
} = styles

interface NavItem {
  id: TabType
  label: string
  Icon: ComponentType<IconProps>
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Inicio', Icon: IconHome },
  { id: 'calendar', label: 'Calendario', Icon: IconCalendar },
  { id: 'statistics', label: 'Resumen', Icon: IconChartPie },
  { id: 'cards', label: 'Tarjetas', Icon: IconCreditCard },
  { id: 'settings', label: 'Ajustes', Icon: IconSettings },
]

interface Props {
  /** The tab whose screen is showing. */
  activeTab: TabType
  /** Called with the tapped tab. */
  onSelectTab: (tab: TabType) => void
}

/**
 * The tab bar docked at the bottom of the app (Material 3 style). The active tab shows a
 * brand-tinted highlight (which slides from tab to tab) and a bolder label, so it doesn't
 * rely on color alone.
 * Icons keep the same stroke in both states, so nothing jumps when switching tabs.
 */
const BottomNavBar = ({ activeTab, onSelectTab }: Props) => (
  <nav className={navContainer} aria-label="Secciones">
    <div className={navWrapper}>
      {NAV_ITEMS.map(({ id, label, Icon }) => {
        const isActive = activeTab === id
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelectTab(id)}
            aria-current={isActive ? 'page' : undefined}
            className={cn(navItem, isActive && active)}
          >
            {/* Only the active tab renders it; the shared layoutId makes Motion slide it
                from the previous tab instead of just appearing */}
            {isActive && (
              <motion.span
                layoutId="navHighlight"
                className={highlight}
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
              />
            )}
            <span className={pill}>
              <Icon className={icon} />
            </span>
            <Typography variant="label" size="xs" className={labelClass}>
              {label}
            </Typography>
          </button>
        )
      })}
    </div>
  </nav>
)

export default BottomNavBar
