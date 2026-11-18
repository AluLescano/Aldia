// TYPES
import type { ReactNode } from 'react'

// COMPONENTS
import Typography from '@/shared/ui/Typography/Typography'
import Button from '@/shared/ui/Button/Button'

// ASSETS
import { IconArrow } from '@/assets/icons/IconArrow'

import styles from './SettingsRow.module.scss'

interface Props {
  /** Shown in the tinted tile on the left, e.g. `<IconDownload />`. */
  icon: ReactNode
  title: string
  /** The grey line under the title: what the row does. */
  description: string
  /** A › at the end. Only for rows that open another screen or a picker; leave it off for actions. */
  chevron?: boolean
  onClick?: () => void
}

/**
 * One row of an Ajustes card: icon tile, title, description and an optional chevron.
 * The whole row is one button (press tint and ripple from `Button`), so the target is the
 * full row and screen readers read its text as the button's name. Rows stacked in the same
 * card get a divider between them.
 *
 * @example
 * <SettingsRow
 *   icon={<IconDownload />}
 *   title="Exportar backup"
 *   description="Guarda tus datos en un archivo"
 *   onClick={exportBackup}
 * />
 */
const SettingsRow = ({ icon, title, description, chevron, onClick }: Props) => {
  const { row, tile, text, descriptionClass, chevronContainer } = styles

  return (
    <Button variant="secondary" width="full" className={row} onClick={onClick}>
      <span className={tile}>{icon}</span>
      <span className={text}>
        <Typography variant="label" size="md">
          {title}
        </Typography>
        <Typography variant="label" size="sm" className={descriptionClass}>
          {description}
        </Typography>
      </span>
      {chevron && <IconArrow className={chevronContainer} />}
    </Button>
  )
}

export default SettingsRow
