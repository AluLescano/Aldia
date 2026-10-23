// DEPENDENCIES
import { type SubmitEvent, useId, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'

// HOOKS
import { useSubscriptionForm } from '../../hooks/useSubscriptionForm'

// STORES
import { useCategoryStore } from '@/features/categories/store/categoryStore'

// UTILS
import { formatBillingCycle } from '../../utils/billingCycle'
import { getCurrencySymbol } from '@/shared/lib/currencies'
import { formatDate } from '@/shared/lib/formatDate'

// COMPONENTS
import Avatar from '@/shared/ui/Avatar/Avatar'
import InputText from '@/shared/ui/InputText/InputText'
import InputAmount from '@/shared/ui/InputAmount/InputAmount'
import InputSelect from '@/shared/ui/InputSelect/InputSelect'
import InputDate from '@/shared/ui/InputDate/InputDate'
import Switch from '@/shared/ui/Switch/Switch'
import Button from '@/shared/ui/Button/Button'
import FormRow from './FormRow'
import SubscriptionFormSheets, { type SheetName } from './SubscriptionFormSheets'

// TYPES
import type { SubscriptionFormValues } from '../../types'

// ASSETS
import { IconArrow } from '@/assets/icons/IconArrow'

import styles from './SubscriptionForm.module.scss'

interface Props {
  /** Starting values. Read once: to reset the form, give it a new `key`. */
  initialValues: SubscriptionFormValues
  /** Text of the submit button, e.g. "Guardar". */
  submitLabel: string
  /** View mode: every control is disabled and the submit button is hidden. */
  readOnly?: boolean
  /** Called with the values only when the whole form is valid. */
  onSubmit: (values: SubscriptionFormValues) => void
}

/**
 * The subscription form used to create, view and edit a subscription.
 * Its state and rules live in `useSubscriptionForm`; its pickers in `SubscriptionFormSheets`.
 */
const SubscriptionForm = ({ initialValues, submitLabel, readOnly, onSubmit }: Props) => {
  const {
    fieldSet,
    fieldGroup,
    logoWrapper,
    container,
    collapse,
    buttonContainer,
    buttonNotification,
  } = styles

  const form = useSubscriptionForm(initialValues)
  // The notifications row holds a plain Button, so the row label needs its id by hand
  const notificationsId = useId()
  const { values, isValid, hasEndDate, trialDays, setField, touch, touchAll, errorFor } =
    form

  const [openSheet, setOpenSheet] = useState<SheetName | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const reduceMotion = useReducedMotion()

  const categoryName = useCategoryStore(
    (state) => state.categories.find((c) => c.id === values.categoryId)?.name ?? '',
  )

  const billingLabel =
    trialDays !== undefined
      ? `Prueba ${trialDays} d · ${formatBillingCycle(values.billingCycle)}`
      : formatBillingCycle(values.billingCycle)

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    touchAll()
    if (isValid) {
      onSubmit(values)
      return
    }
    // The errors render on the next frame, then the first invalid field exists in the DOM
    requestAnimationFrame(() => {
      const first = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')
      first?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      first?.focus({ preventScroll: true })
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <div className={fieldSet}>
        <fieldset disabled={readOnly} className={fieldGroup}>
          <div className={logoWrapper}>
            <Avatar
              src={values.iconUrl}
              iconKey={values.iconKey}
              name={values.name}
              size="large"
            />
          </div>

          <div className={container}>
            <FormRow label="Nombre">
              <InputText
                size="medium"
                width="fit"
                value={values.name}
                onChange={(event) => setField('name', event.currentTarget.value)}
                onBlur={() => touch('name')}
                errorMessage={errorFor('name')}
              />
            </FormRow>
            <FormRow label="Formato del Cobro">
              <InputSelect
                size="medium"
                width="auto"
                placeholder="Formato del Cobro"
                value={billingLabel}
                onClick={() => setOpenSheet('billingCycle')}
                errorMessage={errorFor('billingCycle')}
              />
            </FormRow>
            {/* With a trial, the date is when it starts; the first charge is the day it ends */}
            <FormRow label={values.trial ? 'Inicio de la prueba' : 'Inicio del Cobro'}>
              <InputDate
                size="medium"
                width="fit"
                value={values.trial?.startDate ?? values.firstBillDate}
                // So nobody has to add the trial days in their head
                subText={
                  values.trial
                    ? `Primer cobro: ${formatDate(values.firstBillDate)}`
                    : undefined
                }
                onClick={() => setOpenSheet('firstBillDate')}
                errorMessage={errorFor('firstBillDate')}
              />
            </FormRow>
            <FormRow label="Fin del Cobro">
              <Switch
                checked={hasEndDate}
                onChange={form.toggleEndDate}
                label="Tiene fecha de fin"
              />
            </FormRow>
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
                  <FormRow label="Fecha de fin del cobro">
                    <InputDate
                      size="medium"
                      width="fit"
                      value={values.endDate ?? ''}
                      onClick={() => setOpenSheet('endDate')}
                      errorMessage={errorFor('endDate')}
                    />
                  </FormRow>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className={container}>
            <FormRow label="Tipo de Moneda">
              <InputSelect
                size="medium"
                width="auto"
                placeholder="Moneda"
                value={values.currency}
                onClick={() => setOpenSheet('currency')}
                errorMessage={errorFor('currency')}
              />
            </FormRow>
            <FormRow label="Monto">
              <InputAmount
                size="medium"
                width="fit"
                minWidth="0" // hug "0.00" when empty, grow while typing
                value={values.price}
                // The symbol of the currency picked in this form; '$' if none is picked yet
                currencySymbol={
                  values.currency ? getCurrencySymbol(values.currency) : '$'
                }
                onChange={(event) => setField('price', event.currentTarget.value)}
                onBlur={() => touch('price')}
                errorMessage={errorFor('price')}
              />
            </FormRow>
          </div>
        </fieldset>
        {/* Outside the locked parts: in view mode it still opens, to see the notifications */}
        {values.billingCycle.type !== 'one-time' && (
          <div className={container}>
            <FormRow label="Notificaciones" controlId={notificationsId}>
              <Button
                id={notificationsId}
                size="small"
                className={buttonNotification}
                onClick={() => setOpenSheet('reminders')}
              >
                <IconArrow />
              </Button>
            </FormRow>
          </div>
        )}
        <fieldset disabled={readOnly} className={fieldGroup}>
          <div className={container}>
            <FormRow label="Categoría">
              <InputSelect
                size="medium"
                width="auto"
                placeholder="Categoría"
                value={categoryName}
                onClick={() => setOpenSheet('categoryId')}
                errorMessage={errorFor('categoryId')}
              />
            </FormRow>
            {/* Payment methods come with the Cards screen */}
            <FormRow label="Cobrado en">
              <InputSelect
                size="medium"
                width="fit"
                placeholder="Cobrado en"
                value={values.paymentMethodId ?? ''}
                onClick={() => {}}
                disabled
              />
            </FormRow>
          </div>

          {!readOnly && (
            // Wakes up with a small bump when the form becomes valid. `initial={false}`: a form
            // that opens already valid (editing) doesn't bump
            <motion.div
              className={buttonContainer}
              initial={false}
              animate={{ scale: isValid ? [1, 1.03, 1] : 1 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <Button width="full" size="large" type="submit" aria-disabled={!isValid}>
                {submitLabel}
              </Button>
            </motion.div>
          )}
        </fieldset>
      </div>

      <SubscriptionFormSheets
        form={form}
        openSheet={openSheet}
        onClose={() => setOpenSheet(null)}
        readOnly={readOnly}
      />
    </form>
  )
}

export default SubscriptionForm
