import React from 'react'
import type { TabType } from '@/shared/types'
import styles from './BottomNavBar.module.scss'

interface BottomNavBarProps {
  activeTab: TabType
  onSelectTab: (tab: TabType) => void
}

interface NavItem {
  id: TabType
  label: string
  icon: (active: boolean) => React.ReactNode
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onSelectTab }) => {
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

  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: (active) => (
        <svg
          className={icon}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={active ? 2.5 : 1.75}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 9.75L12 3l9 6.75V20.25a.75.75 0 01-.75.75H4.5a.75.75 0 01-.75-.75V9.75z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 21V12h6v9" />
        </svg>
      ),
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: (active) => (
        <svg
          className={icon}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={active ? 2.5 : 1.75}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
          />
        </svg>
      ),
    },
    {
      id: 'statistics',
      label: 'Analytics',
      icon: (active) => (
        <svg
          className={icon}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={active ? 2.5 : 1.75}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z"
          />
        </svg>
      ),
    },
    {
      id: 'cards',
      label: 'Cards',
      icon: (active) => (
        <svg
          className={icon}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={active ? 2.5 : 1.75}
        >
          <rect
            x="2"
            y="5"
            width="20"
            height="14"
            rx="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="2"
            y1="10"
            x2="22"
            y2="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: (active) => (
        <svg
          className={icon}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={active ? 2.5 : 1.75}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
  ]

  return (
    <nav className={navContainer}>
      <div className={navWrapper}>
        {navItems.map((item) => {
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`${navItem} ${isActive ? activeStyle : inactiveStyle}`}
            >
              <div className={iconWrapper}>
                {item.icon(isActive)}
                {isActive && <span className={activeIndicator} />}
              </div>
              <span className={labelStyle}>{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
