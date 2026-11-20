// UTILS
import { formatDate } from '@/shared/lib/formatDate'
import { formatBillingCycle } from '../../utils/billingCycle'
import { landsOn, type ScheduleEdit } from '../../utils/scheduleEdit'

// COMPONENTS
import BottomSheet from '@/shared/ui/BottomSheet/BottomSheet'
import Typography from '@/shared/ui/Typography/Typography'

// ASSETS
import { IconCalendarClock } from '@/assets/icons/IconCalendarClock'
import { IconCalendar } from '@/assets/icons/IconCalendar'

// Same rows as the price's "¿Desde cuándo?", so both questions look alike
import styles from '../PriceChangeSheet/PriceChangeSheet.module.scss'

const { intro, list, row, rowIcon, rowText, mutedText, sectionLabel } = styles

interface Props {
  isOpen: boolean
  /** Closing without picking cancels the save; the form keeps the typed values. */
  onClose: () => void
  /** The new charge day and cycle from the form. */
  edit: ScheduleEdit | null
  /** `YYYY-MM-DD`, the next charge with the old rhythm: the usual answer, so it's first. */
  nextCharge: string
  /** `YYYY-MM-DD`, the charges that already happened, newest first (see `pastCharges`). */
  pastCharges: string[]
  /** `YYYY-MM-DD`, the subscription's first charge: picking it corrects everything. */
  firstCharge: string
  /** Called with the first charge that changes (an old charge day). */
  onPick: (from: string) => void
}

/**
 * "¿Desde cuándo?": asked when the charge day or the cycle of a subscription that already
 * had charges changes. The user picks the first charge that changes; that one and the ones
 * after follow the new rhythm, the ones before stay. Each row says where its charge lands,
 * so nothing happens by surprise. Picking the first charge corrects the whole history.
 */
const ScheduleChangeSheet = ({
  isOpen,
  onClose,
  edit,
  nextCharge,
  pastCharges,
  firstCharge,
  onPick,
}: Props) => {
  // What happens to one old charge: the day it moves to, or the new cycle if it stays put
  const effect = (charge: string) => {
    if (!edit) return ''
    const landing = landsOn(edit, charge)
    return landing === charge
      ? `pasa a ${formatBillingCycle(edit.billingCycle).toLowerCase()}`
      : `pasa al ${formatDate(landing)}`
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="¿Desde cuándo?">
      <Typography variant="body" size="sm" className={intro}>
        Elige el primer cobro que cambia. Los anteriores quedan igual.
      </Typography>
      <div className={list}>
        <button type="button" className={row} onClick={() => onPick(nextCharge)}>
          <IconCalendarClock className={rowIcon} />
          <span className={rowText}>
            <Typography variant="label" size="md">
              Desde el próximo cobro
            </Typography>
            <Typography variant="label" size="sm" className={mutedText}>
              {`${formatDate(nextCharge)} · ${effect(nextCharge)}`}
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
              <Typography variant="label" size="sm" className={mutedText}>
                {date === firstCharge ? `${effect(date)} · corrige todo` : effect(date)}
              </Typography>
            </span>
          </button>
        ))}
      </div>
    </BottomSheet>
  )
}

export default ScheduleChangeSheet
