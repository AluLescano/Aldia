// UTILS
import { formatDate } from '@/shared/lib/formatDate'
import { formatBillingCycle } from '../../utils/billingCycle'
import { landsOn, type ScheduleEdit } from '../../utils/scheduleEdit'

// COMPONENTS
import ChangeFromSheet from '../ChangeFromSheet/ChangeFromSheet'

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
    <ChangeFromSheet
      isOpen={isOpen}
      onClose={onClose}
      intro="Elige el primer cobro que cambia. Los anteriores quedan igual."
      nextCharge={nextCharge}
      nextDescription={`${formatDate(nextCharge)} · ${effect(nextCharge)}`}
      pastCharges={pastCharges}
      describePast={(date) =>
        date === firstCharge ? `${effect(date)} · corrige todo` : effect(date)
      }
      onPick={onPick}
    />
  )
}

export default ScheduleChangeSheet
