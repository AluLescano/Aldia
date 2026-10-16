import { parseISODate, toISODate } from '@/shared/lib/isoDate'
import type { FormErrors, SubscriptionFormValues } from '../types'

// A real calendar day: '2026-02-31' has the right shape, but turns into March 3rd and fails
const isValidDate = (date: string) => {
  const parsed = parseISODate(date)
  return parsed !== null && !isNaN(parsed.getTime()) && toISODate(parsed) === date
}

/**
 * Reads a typed price. Accepts a comma or a dot and at most 2 decimals.
 *
 * @returns the number, or `null` if the text is not a valid price.
 * @example
 * parsePrice('1299,5') // 1299.5
 * parsePrice('12.345') // null (3 decimals)
 */
export function parsePrice(raw: string): number | null {
  const normalized = raw.trim().replace(',', '.')
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null
  const value = Number(normalized)
  return Number.isFinite(value) ? value : null
}

/**
 * Checks the whole form. Pure: no React, no stores.
 *
 * @returns one Spanish message per invalid field. An empty object means the form is valid.
 */
export function validateSubscriptionForm(values: SubscriptionFormValues): FormErrors {
  const errors: FormErrors = {}
  if (values.name.trim().length === 0) {
    errors.name = 'El nombre no puede estar vacío'
  }
  /* If price == 0, it's cause it's a gift or it's a trial */
  if (parsePrice(values.price) === null) {
    errors.price = 'Ingrese un número válido (ej: 2000,00)'
  }
  if (values.currency === '') {
    errors.currency = 'El tipo de moneda no puede estar vacío'
  }
  if (values.firstBillDate.trim().length === 0) {
    errors.firstBillDate = 'La fecha de cobro no puede estar vacía'
  } else if (!isValidDate(values.firstBillDate)) {
    errors.firstBillDate = 'Fecha de cobro inválida'
  }
  if (values.endDate && !isValidDate(values.endDate)) {
    errors.endDate = 'Fecha de fin de cobro inválida'
  }
  if (
    values.endDate &&
    !errors.firstBillDate &&
    !errors.endDate &&
    values.endDate <= values.firstBillDate
  ) {
    errors.endDate = 'La fecha de fin debe ser posterior a la fecha de inicio'
  }
  if (values.trial) {
    if (!isValidDate(values.trial.startDate)) {
      errors.trial = 'Fecha de inicio de prueba inválida'
    } else if (!isValidDate(values.trial.endDate)) {
      errors.trial = 'Fecha de cierre de prueba inválida'
    }
    if (!errors.trial && values.trial.endDate <= values.trial.startDate) {
      errors.trial = 'La fecha de fin debe ser posterior a la fecha de inicio'
    }
  }
  if (values.billingCycle.type === 'every') {
    const { interval } = values.billingCycle
    if (!Number.isInteger(interval) || interval < 1) {
      errors.billingCycle = 'El intervalo debe ser un número entero mayor a 0'
    }
  }
  if (values.categoryId.trim().length === 0) {
    errors.categoryId = 'Necesita seleccionar una categoría'
  }

  return errors
}
