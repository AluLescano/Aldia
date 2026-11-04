// DEPENDENCIES
import { useEffect, type ComponentType } from 'react'
import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useSpring,
  type MotionStyle,
} from 'motion/react'

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
  bar,
  ball,
  navWrapper,
  navItem,
  active,
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
 * The tab bar floating at the bottom of the app: a glass bar with a notch, and the active
 * tab's icon in a brand-colored ball that sits in it. Tapping a tab springs the ball and the
 * notch over to it (a gentle overshoot, or a jump with reduced motion), and only the active
 * tab shows its label, so the selection doesn't rely on color alone.
 */
const BottomNavBar = ({ activeTab, onSelectTab }: Props) => {
  const activeIndex = NAV_ITEMS.findIndex((item) => item.id === activeTab)
  const ActiveIcon = NAV_ITEMS[activeIndex].Icon
  // The tabs are equal and edge to edge, so tab i's centre is (i + 0.5) / 5 of the bar
  const target = ((activeIndex + 0.5) / NAV_ITEMS.length) * 100
  // A motion value: it springs to each new target without re-rendering React
  const notchX = useSpring(target, { stiffness: 400, damping: 30 })
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (reduceMotion)
      notchX.jump(target) // go there instantly
    else notchX.set(target) // spring there
  }, [target, reduceMotion, notchX])

  const notchXPercent = useMotionTemplate`${notchX}%`

  return (
    // --notch-x is read by both the bar's mask and the ball's `left`, so they move together
    <motion.nav
      className={navContainer}
      aria-label="Secciones"
      style={{ '--notch-x': notchXPercent } as MotionStyle}
    >
      <div className={bar} aria-hidden="true" />
      <span className={ball} aria-hidden="true">
        <ActiveIcon className={icon} />
      </span>
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
    </motion.nav>
  )
}

export default BottomNavBar
