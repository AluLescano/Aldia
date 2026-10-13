// HOOKS
import { type SubmitEvent, useState } from 'react'

// TYPES
import {
  validateSubscriptionForm,
  type SubscriptionFormValues,
} from '../../utils/validateSubscriptionForm'

// DATA
import { addCycles, BILLING_CYCLE_LABELS } from '../../utils/billingCycle'

// COMPONENTS
import Typography from '@/shared/ui/Typography/Typography'
import InputText from '@/shared/ui/InputText/InputText'
import InputAmount from '@/shared/ui/InputAmount/InputAmount'
import InputSelect from '@/shared/ui/InputSelect/InputSelect'
import InputDate from '@/shared/ui/InputDate/InputDate'
import Switch from '@/shared/ui/Switch/Switch'
import Button from '@/shared/ui/Button/Button'

// ANIMATIONS
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'

// ASSETS
import { IconArrow } from '@/assets/icons/IconArrow'

import styles from './SubscriptionForm.module.scss'

interface Props {
  initialValues: SubscriptionFormValues
  submitLabel: string
  onSubmit: (values: SubscriptionFormValues) => void
}

const SubscriptionForm = ({ initialValues, submitLabel, onSubmit }: Props) => {
  const { container, inputContainer, collapse, buttonContainer, buttonNotification } =
    styles
  const [values, setValues] = useState(initialValues)
  const [touched, setTouched] = useState<
    Partial<Record<keyof SubscriptionFormValues, boolean>>
  >({})
  const [hasEndDate, setHasEndDate] = useState(Boolean(initialValues.endDate))

  const errors = validateSubscriptionForm(values)
  const reduceMotion = useReducedMotion()

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
            value={values.billingCycle ? BILLING_CYCLE_LABELS[values.billingCycle] : ''}
            onClick={() => {}}
            errorMessage={touched.billingCycle ? errors.billingCycle : undefined}
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
            onClick={() => {}}
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
                  onClick={() => {}}
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
            onClick={() => {}}
            errorMessage={touched.currency ? errors.currency : undefined}
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
            value={values.categoryId}
            onClick={() => {}}
            errorMessage={touched.categoryId ? errors.categoryId : undefined}
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
    </form>
  )
}

export default SubscriptionForm
