// DEPENDENCIES
import type { ReactNode } from 'react'

// HOOKS
import { useCategoryEditor } from '@/features/categories/hooks/useCategoryEditor'

// STORES
import { OTHERS_ID } from '@/features/categories/categoryStore'

// UTILS
import { addDays } from '@/shared/lib/isoDate'
import { DEFAULT_CURRENCIES } from '@/shared/lib/currencies'

// COMPONENTS
import BottomSheet from '@/shared/ui/BottomSheet/BottomSheet'
import DatePicker from '@/shared/ui/DatePicker/DatePicker'
import CurrencyPicker from '@/shared/ui/CurrencyPicker/CurrencyPicker'
import BillingCyclePicker from '../BillingCyclePicker/BillingCyclePicker'
import CategoryPicker from '@/features/categories/components/CategoryPicker/CategoryPicker'
import CategoryFooter from '@/features/categories/components/CategoryPicker/CategoryFooter'

// TYPES
import type { SubscriptionFormState } from '../../hooks/useSubscriptionForm'
import type { SubscriptionFormValues } from '../../types'

/** The form fields that are picked from a bottom sheet. Also the name of each sheet. */
export type SheetName =
  'billingCycle' | 'firstBillDate' | 'endDate' | 'currency' | 'categoryId'

interface Sheet {
  title?: string
  content: ReactNode
  footer?: ReactNode
}

interface Props {
  /** The form returned by `useSubscriptionForm`. */
  form: SubscriptionFormState
  /** Which sheet is open, or `null` when none is. */
  openSheet: SheetName | null
  /** Called after the sheet closes (by picking, the backdrop, a drag or Escape). */
  onClose: () => void
}

/**
 * The bottom sheet of the subscription form, showing whichever picker is open.
 * Closing a sheet marks its field as touched, so a missing value shows its error.
 */
const SubscriptionFormSheets = ({ form, openSheet, onClose }: Props) => {
  const { values, setField, touch, setBillingCycle, setTrialDays, trialDays } = form

  const close = () => {
    if (openSheet) touch(openSheet)
    categoryEditor.reset() // reopening the category sheet always starts in the plain list
    onClose()
  }

  // Picking a value closes the sheet
  const pick = <K extends SheetName>(field: K, value: SubscriptionFormValues[K]) => {
    setField(field, value)
    close()
  }

  // Lives here, not inside the picker, so the sheet footer can use it too
  const categoryEditor = useCategoryEditor({
    onCreated: (category) => pick('categoryId', category.id),
    onDeleted: (id) => {
      if (id === values.categoryId) pick('categoryId', OTHERS_ID)
    },
  })

  const sheets: Record<SheetName, Sheet> = {
    billingCycle: {
      title: 'Formato del cobro',
      content: (
        <BillingCyclePicker
          cycle={values.billingCycle}
          trialDays={trialDays}
          onChange={setBillingCycle}
          onTrialChange={setTrialDays}
        />
      ),
    },
    firstBillDate: {
      content: (
        <DatePicker
          value={values.firstBillDate}
          onSelect={(iso) => pick('firstBillDate', iso)}
        />
      ),
    },
    endDate: {
      content: (
        <DatePicker
          value={values.endDate ?? values.firstBillDate}
          min={addDays(values.firstBillDate, 1)} // the end must come after the first charge
          onSelect={(iso) => pick('endDate', iso)}
        />
      ),
    },
    currency: {
      title: 'Tipo de moneda',
      content: (
        <CurrencyPicker
          currencies={DEFAULT_CURRENCIES}
          selectedCode={values.currency}
          onSelect={(code) => pick('currency', code)}
        />
      ),
    },
    categoryId: {
      title: 'Categoría',
      content: (
        <CategoryPicker
          value={values.categoryId}
          onSelect={(id) => pick('categoryId', id)}
          editor={categoryEditor}
        />
      ),
      footer: <CategoryFooter editor={categoryEditor} />,
    },
  }

  const sheet = openSheet ? sheets[openSheet] : null

  return (
    <BottomSheet
      isOpen={sheet !== null}
      title={sheet?.title}
      onClose={close}
      footer={sheet?.footer}
    >
      {sheet?.content}
    </BottomSheet>
  )
}

export default SubscriptionFormSheets
