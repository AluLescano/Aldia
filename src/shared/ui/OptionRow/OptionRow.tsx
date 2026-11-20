// TYPES
import type { ReactNode } from 'react'

// UTILS
import { cn } from '@/shared/lib/cn'

// COMPONENTS
import Button from '../Button/Button'
import Typography from '../Typography/Typography'

// ASSETS
import { IconCheck } from '@/assets/icons/IconCheck'

import styles from './OptionRow.module.scss'

interface Props {
  /** The icon on the left, e.g. `<IconCalendar />`. Muted grey, green when highlighted. */
  icon?: ReactNode
  title: string
  /** A muted second line, e.g. "pasa al 14 Nov 26". Missing = one line only. */
  description?: string
  /** Tinted green: the current choice, or the usual answer. */
  highlighted?: boolean
  /**
   * Makes the row a radio in a `role="radiogroup"` (for sheets where one option is the
   * current one, like "Ordenar por"): `true` adds a ✓ at the end. Leave it out for rows
   * that are just actions, like the "¿Desde cuándo?" choices: they stay plain buttons.
   */
  checked?: boolean
  onClick: () => void
}

/**
 * One row of a "pick one" sheet: icon, title, an optional muted line and, for radios, a ✓.
 * The whole row is one button (press tint and ripple from `Button`), so the target is the
 * full row and screen readers read its text as the button's name. Shared by "Ordenar por"
 * and both "¿Desde cuándo?" sheets.
 *
 * @example
 * // A radio, the current sort
 * <OptionRow icon={<IconSortAZ />} title="Nombre (A-Z)" highlighted checked onClick={pick} />
 * // A plain choice with a second line
 * <OptionRow icon={<IconCalendar />} title="Cobro del 10 Nov 26" description="pasa al 14 Nov 26" onClick={pick} />
 */
const OptionRow = ({
  icon,
  title,
  description,
  highlighted,
  checked,
  onClick,
}: Props) => {
  const { row, highlightedRow, rowIcon, rowText, mutedText, check } = styles

  return (
    <Button
      variant="secondary"
      width="full"
      // Only a radio when `checked` is given; `aria-checked` is left out otherwise
      role={checked === undefined ? undefined : 'radio'}
      aria-checked={checked}
      className={cn(row, highlighted && highlightedRow)}
      onClick={onClick}
    >
      {icon && <span className={rowIcon}>{icon}</span>}
      <span className={rowText}>
        <Typography variant="label" size="md">
          {title}
        </Typography>
        {description && (
          <Typography variant="label" size="sm" className={mutedText}>
            {description}
          </Typography>
        )}
      </span>
      {checked && <IconCheck className={check} />}
    </Button>
  )
}

export default OptionRow
