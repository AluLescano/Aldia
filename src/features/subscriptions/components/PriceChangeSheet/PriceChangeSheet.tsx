// UTILS
import { formatDate } from '@/shared/lib/formatDate'

// COMPONENTS
import ChangeFromSheet from '../ChangeFromSheet/ChangeFromSheet'

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
  <ChangeFromSheet
    isOpen={isOpen}
    onClose={onClose}
    intro="Los cobros anteriores mantienen su precio."
    nextCharge={nextCharge}
    nextDescription={formatDate(nextCharge)}
    pastCharges={pastCharges}
    onPick={onPick}
  />
)

export default PriceChangeSheet
