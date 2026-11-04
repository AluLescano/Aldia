// UTILS
import { formatDate } from '@/shared/lib/formatDate'

// COMPONENTS
import BottomSheet from '@/shared/ui/BottomSheet/BottomSheet'
import Typography from '@/shared/ui/Typography/Typography'

// ASSETS
import { IconCalendarClock } from '@/assets/icons/IconCalendarClock'
import { IconCalendar } from '@/assets/icons/IconCalendar'

import styles from './PriceChangeSheet.module.scss'

const { intro, list, row, rowIcon, rowText, mutedText, sectionLabel } = styles

interface Props {
  isOpen: boolean
  /** Closing without picking cancels the save; the form keeps the typed values. */
  onClose: () => void
  /** `YYYY-MM-DD`, the next charge: the usual answer, so it's first. */
  nextCharge: string
  /** `YYYY-MM-DD`, the charges that already happened, newest first (see `pastCharges`). */
  pastCharges: string[]
  /** Called with the charge day the new price starts on. */
  onPick: (from: string) => void
}

/**
 * "¿Desde cuándo?": asked when the price of a subscription that already had charges
 * changes. The next charge is the usual answer; a past one fixes a price that went up
 * earlier and was only noticed now. The charges before the picked one keep their price.
 */
const PriceChangeSheet = ({
  isOpen,
  onClose,
  nextCharge,
  pastCharges,
  onPick,
}: Props) => (
  <BottomSheet isOpen={isOpen} onClose={onClose} title="¿Desde cuándo?">
    <Typography variant="body" size="sm" className={intro}>
      Los cobros anteriores mantienen su precio.
    </Typography>
    <div className={list}>
      <button type="button" className={row} onClick={() => onPick(nextCharge)}>
        <IconCalendarClock className={rowIcon} />
        <span className={rowText}>
          <Typography variant="label" size="md">
            Desde el próximo cobro
          </Typography>
          <Typography variant="label" size="sm" className={mutedText}>
            {formatDate(nextCharge)}
          </Typography>
        </span>
      </button>

      {pastCharges.length > 0 && (
        <Typography variant="label" size="sm" className={sectionLabel}>
          O desde un cobro anterior
        </Typography>
      )}
      {pastCharges.map((date) => (
        <button key={date} type="button" className={row} onClick={() => onPick(date)}>
          <IconCalendar className={rowIcon} />
          <span className={rowText}>
            <Typography variant="label" size="md">
              {`Cobro del ${formatDate(date)}`}
            </Typography>
          </span>
        </button>
      ))}
    </div>
  </BottomSheet>
)

export default PriceChangeSheet
