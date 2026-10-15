// HOOKS
import { type ReactNode, type SubmitEvent, useState } from 'react'
import { useCategoryEditor } from '@/features/categories/useCategoryEditor'

// TYPES
import type { BillingCycle } from '@/shared/types'

// TYPES
import {
  validateSubscriptionForm,
  type SubscriptionFormValues,
} from '../../utils/validateSubscriptionForm'

// DATA
import { addCycles, formatBillingCycle } from '../../utils/billingCycle'
import { daysBetween } from '@/shared/lib/isoDate'
import { DEFAULT_CURRENCIES } from '@/shared/lib/currencies'
import { OTHERS_ID, useCategoryStore } from '@/features/categories/categoryStore'

// COMPONENTS
import Avatar from '@/shared/ui/Avatar/Avatar'
import Typography from '@/shared/ui/Typography/Typography'
import InputText from '@/shared/ui/InputText/InputText'
import InputAmount from '@/shared/ui/InputAmount/InputAmount'
import InputSelect from '@/shared/ui/InputSelect/InputSelect'
import InputDate from '@/shared/ui/InputDate/InputDate'
import Switch from '@/shared/ui/Switch/Switch'
import Button from '@/shared/ui/Button/Button'
import BillingCyclePicker, {
  type BillingChoice,
} from '../BillingCyclePicker/BillingCyclePicker'
import DatePicker from '@/shared/ui/DatePicker/DatePicker'
import CurrencyPicker from '@/shared/ui/CurrencyPicker/CurrencyPicker'
import CategoryPicker from '../CategoryPicker/CategoryPicker'
import CategoryFooter from '../CategoryPicker/CategoryFooter'
import BottomSheet from '@/shared/ui/BottomSheet/BottomSheet'

// ANIMATIONS
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'

// ASSETS
import { IconArrow } from '@/assets/icons/IconArrow'

import styles from './SubscriptionForm.module.scss'

type SheetName = 'billingCycle' | 'firstBillDate' | 'endDate' | 'currency' | 'categoryId' // add the others when they exist

interface Props {
  initialValues: SubscriptionFormValues
  submitLabel: string
  onSubmit: (values: SubscriptionFormValues) => void
}

const SubscriptionForm = ({ initialValues, submitLabel, onSubmit }: Props) => {
  const {
    logoWrapper,
    container,
    inputContainer,
    collapse,
    buttonContainer,
    buttonNotification,
  } = styles
  const [values, setValues] = useState(initialValues)
  const [touched, setTouched] = useState<
    Partial<Record<keyof SubscriptionFormValues, boolean>>
  >({})
  const [hasEndDate, setHasEndDate] = useState(Boolean(initialValues.endDate))

  const errors = validateSubscriptionForm(values)
  const reduceMotion = useReducedMotion()

  const [openSheet, setOpenSheet] = useState<SheetName | null>(null)

  const categoryName = useCategoryStore(
    (state) => state.categories.find((c) => c.id === values.categoryId)?.name ?? '',
  )

  // The hook lives here, not inside the picker, so the sheet footer can use it too.
  // Because the form owns it, it does not reset by itself when the sheet closes (see closeSheet).
  const categoryEditor = useCategoryEditor({
    onCreated: (category) => pick('categoryId', category.id),
    onDeleted: (id) => {
      if (id === values.categoryId) pick('categoryId', OTHERS_ID)
    },
  })

  const closeSheet = (field: keyof SubscriptionFormValues) => {
    setTouched((current) => ({ ...current, [field]: true }))
    setOpenSheet(null)
    categoryEditor.reset() // reopening the category sheet always starts in the plain list
  }

  const trialDays = values.trial
    ? daysBetween(values.trial.startDate, values.trial.endDate)
    : undefined

  const handleBillingChange = (choice: BillingChoice) => {
    setValues((current) => {
      if (choice.mode === 'one-time') {
        return { ...current, billingCycle: { type: 'one-time' }, trial: undefined }
      }
      if (choice.mode === 'every') {
        const { interval, unit } = choice
        return {
          ...current,
          billingCycle: { type: 'every', interval, unit },
          trial: undefined,
        }
      }
      // Trial: the cycle stays as it is, it applies once the trial is over
      const trialCycle: BillingCycle = {
        type: 'every',
        interval: choice.days,
        unit: 'day',
      }
      return {
        ...current,
        trial: {
          startDate: current.firstBillDate,
          endDate: addCycles(current.firstBillDate, trialCycle, 1),
        },
      }
    })
  }

  const pick = <K extends keyof SubscriptionFormValues>(
    field: K,
    value: SubscriptionFormValues[K],
  ) => {
    setValues((current) => ({ ...current, [field]: value }))
    closeSheet(field)
  }

  const handleEndDateToggle = (checked: boolean) => {
    setHasEndDate(checked)
    setValues((current) => ({
      ...current,
      endDate: checked
        ? current.billingCycle
          ? addCycles(current.firstBillDate, current.billingCycle, 1)
          : current.firstBillDate
        : undefined,
    }))
    setTouched((current) => ({ ...current, endDate: false }))
  }

  const sheets: Record<
    SheetName,
    { title?: string; content: ReactNode; footer?: ReactNode }
  > = {
    billingCycle: {
      title: 'Formato del cobro',
      content: (
        <BillingCyclePicker
          cycle={values.billingCycle}
          trialDays={trialDays}
          onChange={handleBillingChange}
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
          min={addCycles(
            values.firstBillDate,
            { type: 'every', interval: 1, unit: 'day' },
            1,
          )}
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

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setTouched({
      name: true,
      billingCycle: true,
      firstBillDate: true,
      currency: true,
      price: true,
      categoryId: true,
    })
    if (Object.keys(errors).length === 0) onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className={logoWrapper}>
        <Avatar src={values.iconUrl} name={values.name} size="large" />
      </div>
      <div className={container}>
        <div className={inputContainer}>
          <Typography variant="body" size="medium">
            Nombre
          </Typography>
          <InputText
            size="medium"
            width="fit"
            value={values.name}
            onChange={(event) => {
              const { value } = event.currentTarget
              setValues((current) => ({ ...current, name: value }))
              setTouched((current) => ({ ...current, name: false }))
            }}
            onBlur={() => setTouched((current) => ({ ...current, name: true }))}
            errorMessage={touched.name ? errors.name : undefined}
          />
        </div>
        <div className={inputContainer}>
          <Typography variant="body" size="medium">
            Formato del Cobro
          </Typography>
          {/* Placeholder */}
          <InputSelect
            size="medium"
            width="fit"
            placeholder={'Formato del Cobro'}
            value={
              trialDays !== undefined
                ? `Prueba ${trialDays} d`
                : formatBillingCycle(values.billingCycle)
            }
            onClick={() => setOpenSheet('billingCycle')}
            errorMessage={touched.billingCycle ? errors.billingCycle : undefined}
            style={{ minWidth: 0, padding: '0 1rem' }}
          />
        </div>
        <div className={inputContainer}>
          <Typography variant="body" size="medium">
            Inicio del Cobro
          </Typography>
          <InputDate
            size="medium"
            width="fit"
            value={values.firstBillDate}
            onClick={() => setOpenSheet('firstBillDate')}
            errorMessage={touched.firstBillDate ? errors.firstBillDate : undefined}
          />
        </div>
        <div className={inputContainer}>
          <Typography variant="body" size="medium">
            Fin del Cobro
          </Typography>
          <Switch
            checked={hasEndDate}
            onChange={handleEndDateToggle}
            label="Tiene fecha de fin"
          />
        </div>
        <AnimatePresence initial={false}>
          {hasEndDate && (
            <motion.div
              key="end-date"
              className={collapse}
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.25, ease: 'easeInOut' }}
            >
              <div className={inputContainer}>
                <Typography variant="body" size="medium">
                  Fecha de fin del cobro
                </Typography>
                <InputDate
                  size="medium"
                  width="fit"
                  value={values.endDate ?? ''}
                  onClick={() => setOpenSheet('endDate')}
                  errorMessage={touched.endDate ? errors.endDate : undefined}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className={container}>
        <div className={inputContainer}>
          <Typography variant="body" size="medium">
            Tipo de Moneda
          </Typography>
          <InputSelect
            size="medium"
            width="fit"
            placeholder={'Moneda'}
            value={values.currency}
            onClick={() => setOpenSheet('currency')}
            errorMessage={touched.currency ? errors.currency : undefined}
            style={{ minWidth: 0, padding: '0 1rem' }}
          />
        </div>
        <div className={inputContainer}>
          <Typography variant="body" size="medium">
            Monto
          </Typography>
          <InputAmount
            size="medium"
            width="fit"
            value={values.price}
            onChange={(event) => {
              const { value } = event.currentTarget
              setValues((current) => ({ ...current, price: value }))
              setTouched((current) => ({ ...current, price: false }))
            }}
            onBlur={() => setTouched((current) => ({ ...current, price: true }))}
            errorMessage={touched.price ? errors.price : undefined}
          />
        </div>
      </div>
      <div className={container}>
        <div className={inputContainer}>
          <Typography variant="body" size="medium">
            Notificaciones
          </Typography>
          <Button size="small" onClick={() => {}} className={buttonNotification}>
            <IconArrow />
          </Button>
        </div>
      </div>

      <div className={container}>
        <div className={inputContainer}>
          <Typography variant="body" size="medium">
            Categoría
          </Typography>
          <InputSelect
            size="medium"
            width="fit"
            placeholder={'Categoría'}
            value={categoryName}
            onClick={() => setOpenSheet('categoryId')}
            errorMessage={touched.categoryId ? errors.categoryId : undefined}
            style={{ minWidth: 0, padding: '0 1rem' }}
          />
        </div>
        <div className={inputContainer}>
          <Typography variant="body" size="medium">
            Cobrado en
          </Typography>
          <InputSelect
            size="medium"
            width="fit"
            placeholder={'Cobrado en'}
            value={values.paymentMethodId ?? ''}
            onClick={() => {}}
            errorMessage={touched.paymentMethodId ? errors.paymentMethodId : undefined}
          />
        </div>
      </div>
      <div className={buttonContainer}>
        <Button width="full" size="large" type="submit">
          {submitLabel}
        </Button>
      </div>
      <BottomSheet
        isOpen={sheet !== null}
        title={sheet?.title}
        onClose={() => openSheet && closeSheet(openSheet)}
        footer={sheet?.footer}
      >
        {sheet?.content}
      </BottomSheet>
    </form>
  )
}

export default SubscriptionForm
