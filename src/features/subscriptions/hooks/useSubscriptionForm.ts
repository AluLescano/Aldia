// DEPENDENCIES
import { useState } from 'react'

// UTILS
import { addDays, daysBetween } from '@/shared/lib/isoDate'
import { addCycles } from '../utils/billingCycle'
import { validateSubscriptionForm } from '../utils/validateSubscriptionForm'

// TYPES
import type { BillingCycle } from '@/shared/types'
import type { SubscriptionFormValues } from '../types'

type Field = keyof SubscriptionFormValues
type Touched = Partial<Record<Field, boolean>>

/** A trial of `days` starting on `startDate`; the first charge is the day it ends. */
const withTrial = (
  values: SubscriptionFormValues,
  startDate: string,
  days: number,
): SubscriptionFormValues => {
  const endDate = addDays(startDate, days)
  return { ...values, trial: { startDate, endDate }, firstBillDate: endDate }
}

/**
 * State and rules of the subscription form, without any markup.
 *
 * Errors follow the "validate on blur" rule: a field shows its error only once it is
 * touched (blurred, picked from a sheet, or the form was submitted), and hides it again
 * while the user edits it.
 *
 * @param initialValues starting values. Read once: to start over, remount the form with a new `key`.
 */
export function useSubscriptionForm(initialValues: SubscriptionFormValues) {
  const [values, setValues] = useState(initialValues)
  const [touched, setTouched] = useState<Touched>({})

  // Calculated every render from the values, so it can never be out of date
  const errors = validateSubscriptionForm(values)
  const isValid = Object.keys(errors).length === 0

  // Derived, not stored: the end date row is open exactly when there is an end date
  const hasEndDate = values.endDate !== undefined

  // "Pago único" is hidden for new subscriptions, but one saved that way can still keep it
  const allowOneTime = initialValues.billingCycle.type === 'one-time'

  const trialDays = values.trial
    ? daysBetween(values.trial.startDate, values.trial.endDate)
    : undefined

  /** Changes one value and hides its error while the user keeps editing. */
  const setField = <K extends Field>(field: K, value: SubscriptionFormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }))
    setTouched((current) => ({ ...current, [field]: false }))
  }

  /** Marks a field as touched, so its error (if any) shows up. */
  const touch = (field: Field) => setTouched((current) => ({ ...current, [field]: true }))

  /** Marks every invalid field as touched. Used on submit to reveal all the errors. */
  const touchAll = () =>
    // From the errors, not from the values: optional fields left `undefined` have no key in `values`
    setTouched((current) => ({
      ...current,
      ...Object.fromEntries(Object.keys(errors).map((field) => [field, true])),
    }))

  /** The error of a field, but only if it is touched. Pass it straight to `errorMessage`. */
  const errorFor = (field: Field) => (touched[field] ? errors[field] : undefined)

  const setBillingCycle = (billingCycle: BillingCycle) =>
    setValues((current) => ({ ...current, billingCycle }))

  /**
   * Turns the free trial on with a length in days, or off with `undefined`.
   * It starts on the date already in the field (so the field doesn't jump), or keeps its
   * start when only the length changes. The first charge moves to the day it ends.
   */
  const setTrialDays = (days: number | undefined) =>
    setValues((current) => {
      if (days === undefined) {
        // Trial off: the first charge goes back to when the trial started
        return {
          ...current,
          trial: undefined,
          firstBillDate: current.trial?.startDate ?? current.firstBillDate,
        }
      }
      return withTrial(current, current.trial?.startDate ?? current.firstBillDate, days)
    })

  /**
   * The date field: with a trial it's the day the trial starts (past or future), and the
   * trial keeps its length; without one it's the first charge.
   */
  const setStartDate = (date: string) => {
    if (trialDays === undefined) {
      setField('firstBillDate', date)
      return
    }
    setValues((current) => withTrial(current, date, trialDays))
    setTouched((current) => ({ ...current, firstBillDate: false }))
  }

  /** Switches the end date on (one cycle after the first charge) or off. */
  const toggleEndDate = (on: boolean) => {
    setValues((current) => ({
      ...current,
      endDate: on ? addCycles(current.firstBillDate, current.billingCycle, 1) : undefined,
    }))
    setTouched((current) => ({ ...current, endDate: false }))
  }

  return {
    values,
    errors,
    isValid,
    hasEndDate,
    trialDays,
    allowOneTime,
    setField,
    touch,
    touchAll,
    errorFor,
    setBillingCycle,
    setTrialDays,
    setStartDate,
    toggleEndDate,
  }
}

/** Everything `useSubscriptionForm` returns, for components that receive the form as a prop. */
export type SubscriptionFormState = ReturnType<typeof useSubscriptionForm>
