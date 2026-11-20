// UTILS
import { formatDate } from '@/shared/lib/formatDate'

// COMPONENTS
import BottomSheet from '@/shared/ui/BottomSheet/BottomSheet'
import OptionRow from '@/shared/ui/OptionRow/OptionRow'
import Typography from '@/shared/ui/Typography/Typography'

// ASSETS
import { IconCalendarClock } from '@/assets/icons/IconCalendarClock'
import { IconCalendar } from '@/assets/icons/IconCalendar'

import styles from './ChangeFromSheet.module.scss'

const { intro: introClass, list, sectionLabel } = styles

interface Props {
  isOpen: boolean
  /** Closing without picking cancels the save; the form keeps the typed values. */
  onClose: () => void
  /** The muted line under the title: what happens to the charges before the picked one. */
  intro: string
  /** `YYYY-MM-DD`, the next charge: the usual answer, so it's first and highlighted. */
  nextCharge: string
  /** The second line of the next charge's row, e.g. its date. */
  nextDescription: string
  /** `YYYY-MM-DD`, the charges that already happened, newest first (see `pastCharges`). */
  pastCharges: string[]
  /** The second line of a past charge's row, if it has one ("pasa al 14 Nov 26"). */
  describePast?: (date: string) => string | undefined
  /** Called with the picked charge day. */
  onPick: (date: string) => void
}

/**
 * The "¿Desde cuándo?" layout shared by the price and the schedule questions: the next
 * charge first (the usual answer), then the past ones under "O desde un cobro anterior".
 * Each sheet only says what its rows mean (`PriceChangeSheet`, `ScheduleChangeSheet`).
 */
const ChangeFromSheet = ({
  isOpen,
  onClose,
  intro,
  nextCharge,
  nextDescription,
  pastCharges,
  describePast,
  onPick,
}: Props) => (
  <BottomSheet isOpen={isOpen} onClose={onClose} title="¿Desde cuándo?">
    <Typography variant="body" size="sm" className={introClass}>
      {intro}
    </Typography>
    <div className={list}>
      <OptionRow
        icon={<IconCalendarClock />}
        title="Desde el próximo cobro"
        description={nextDescription}
        highlighted
        onClick={() => onPick(nextCharge)}
      />

      {pastCharges.length > 0 && (
        <Typography variant="label" size="sm" className={sectionLabel}>
          O desde un cobro anterior
        </Typography>
      )}
      {pastCharges.map((date) => (
        <OptionRow
          key={date}
          icon={<IconCalendar />}
          title={`Cobro del ${formatDate(date)}`}
          description={describePast?.(date)}
          onClick={() => onPick(date)}
        />
      ))}
    </div>
  </BottomSheet>
)

export default ChangeFromSheet
