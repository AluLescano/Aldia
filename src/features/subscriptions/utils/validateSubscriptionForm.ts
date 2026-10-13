import { parseISODate, toISODate } from '@/shared/lib/isoDate'
import type { BillingCycle, CurrencyCode, SubscriptionReminder } from '@/shared/types'

export interface SubscriptionFormValues {
  name: string
  price: string
  currency: CurrencyCode | ''
  billingCycle: BillingCycle | ''

  // Fechas de cobro y vigencia
  firstBillDate: string // YYYY-MM-DD
  endDate?: string // YYYY-MM-DD

  trial?: {
    startDate: string // YYYY-MM-DD
    endDate: string // YYYY-MM-DD
  }

  categoryId: string
  paymentMethodId?: string

  reminders: SubscriptionReminder[]

  // Branding
  iconUrl?: string
}

export type FormErrors = Partial<Record<keyof SubscriptionFormValues, string>>

const isValidDate = (date: string) => {
  const test = parseISODate(date)
  return !isNaN(test!.getTime()) && toISODate(test!) === date
}

export function parsePrice(raw: string): number | null {
  const normalized = raw.trim().replace(',', '.')
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null
  const value = Number(normalized)
  return Number.isFinite(value) ? value : null
}

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
  if (values.billingCycle === '') {
    errors.billingCycle = 'El tipo de cobro no puede estar vacío'
  }
  if (values.categoryId.trim().length === 0) {
    errors.categoryId = 'Necesita seleccionar una categoría'
  }

  return errors
}
