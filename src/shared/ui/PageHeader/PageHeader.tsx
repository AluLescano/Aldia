import type { ReactNode } from 'react'

// UTILS
import { cn } from '@/shared/lib/cn'

// COMPONENTS
import Typography from '@/shared/ui/Typography/Typography'

// ASSETS
import IconButton from '@/shared/ui/IconButton/IconButton'
import { IconArrow } from '@/assets/icons/IconArrow'

import styles from './PageHeader.module.scss'

interface Props {
  /** Shown centered; cut with "…" when it doesn't fit. */
  title: string
  /** Called by the back button. */
  onBack: () => void
  /** What the back button does, read by screen readers. Defaults to `Volver`. */
  backLabel?: string
  /** Buttons on the right, e.g. one or more `IconButton`s. */
  actions?: ReactNode
  /** Extra rows under the bar, e.g. a search field. */
  children?: ReactNode
  /**
   * Frosted look: translucent, with a light edge and a sheen, for pages that put
   * `--gradient-aura` behind it. Defaults to the solid surface.
   */
  glass?: boolean
}

/**
 * The top bar of a full-screen page: back button, centered title and optional actions,
 * with optional content underneath. Without actions the title is centered on the screen;
 * with them, it's centered in the space between the back button and the actions.
 *
 * @example
 * <PageHeader title="Agregar Subscripción" onBack={popOverlay} actions={<IconButton ... />}>
 *   <SearchBar />
 * </PageHeader>
 */
const PageHeader = ({
  title,
  onBack,
  backLabel = 'Volver',
  actions,
  children,
  glass = false,
}: Props) => {
  const { container, glassLook, bar, titleSlot, actionSlot, childrenSlot } = styles
  return (
    <header className={cn(container, glass && glassLook)}>
      <div className={bar}>
        <IconButton onClick={onBack} label={backLabel}>
          <IconArrow />
        </IconButton>
        <Typography variant="title" size="md" className={titleSlot}>
          {title}
        </Typography>
        <div className={actionSlot}>{actions}</div>
      </div>
      {children && <div className={childrenSlot}>{children}</div>}
    </header>
  )
}

export default PageHeader
