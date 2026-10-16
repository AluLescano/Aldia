// DEPENDENCIES
import type { ComponentType } from 'react'

// UTILS
import { cn } from '@/shared/lib/cn'

// TYPES
import type { TabType } from '@/shared/types'
import type { IconProps } from '@/assets/icons/Icon'

// ASSETS
import { IconHome } from '@/assets/icons/IconHome'
import { IconCalendarMonth } from '@/assets/icons/IconCalendarMonth'
import { IconChartPie } from '@/assets/icons/IconChartPie'
import { IconCreditCard } from '@/assets/icons/IconCreditCard'
import { IconSettings } from '@/assets/icons/IconSettings'

import styles from './BottomNavBar.module.scss'

const {
  icon,
  navContainer,
  navWrapper,
  navItem,
  active: activeStyle,
  inactive: inactiveStyle,
  iconWrapper,
  activeIndicator,
  label: labelStyle,
} = styles

interface NavItem {
  id: TabType
  label: string
  Icon: ComponentType<IconProps>
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', Icon: IconHome },
  { id: 'calendar', label: 'Calendar', Icon: IconCalendarMonth },
  { id: 'statistics', label: 'Analytics', Icon: IconChartPie },
  { id: 'cards', label: 'Cards', Icon: IconCreditCard },
  { id: 'settings', label: 'Settings', Icon: IconSettings },
]

interface Props {
  activeTab: TabType
  onSelectTab: (tab: TabType) => void
}

/** The tab bar at the bottom of the app. The active tab's icon gets a bolder stroke and a dot. */
const BottomNavBar = ({ activeTab, onSelectTab }: Props) => (
  <nav className={navContainer}>
    <div className={navWrapper}>
      {NAV_ITEMS.map(({ id, label, Icon }) => {
        const isActive = activeTab === id
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelectTab(id)}
            aria-current={isActive ? 'page' : undefined}
            className={cn(navItem, isActive ? activeStyle : inactiveStyle)}
          >
            <div className={iconWrapper}>
              <Icon className={icon} strokeWidth={isActive ? 2.5 : 1.75} />
              {isActive && <span className={activeIndicator} />}
            </div>
            <span className={labelStyle}>{label}</span>
          </button>
        )
      })}
    </div>
  </nav>
)

export default BottomNavBar
