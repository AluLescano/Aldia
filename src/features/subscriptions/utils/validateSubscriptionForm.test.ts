import { describe, expect, it } from 'vitest'

import { parsePrice, validateSubscriptionForm } from './validateSubscriptionForm'
import type { SubscriptionFormValues } from '../types'

// A form that passes every rule; each test breaks one thing
const valid: SubscriptionFormValues = {
  name: 'Netflix',
  price: '10',
  currency: 'USD',
  billingCycle: { type: 'every', interval: 1, unit: 'month' },
  firstBillDate: '2026-10-16',
  categoryId: 'others',
  reminders: [],
}

describe('parsePrice', () => {
  it.each([
    ['1299,5', 1299.5],
    ['1299.50', 1299.5],
    [' 10 ', 10],
    ['0', 0],
  ])('reads %j as %d', (raw, expected) => {
    expect(parsePrice(raw)).toBe(expected)
  })

  it.each(['', 'abc', '12.345', '-5', '1e3', 'Infinity', '12,'])('rejects %j', (raw) => {
    expect(parsePrice(raw)).toBeNull()
  })
})

describe('validateSubscriptionForm', () => {
  it('accepts a complete form', () => {
    expect(validateSubscriptionForm(valid)).toEqual({})
  })

  it('requires a name', () => {
    expect(validateSubscriptionForm({ ...valid, name: '   ' })).toHaveProperty('name')
  })

  it('requires a valid price', () => {
    expect(validateSubscriptionForm({ ...valid, price: '' })).toHaveProperty('price')
  })

  it('requires a currency', () => {
    expect(validateSubscriptionForm({ ...valid, currency: '' })).toHaveProperty(
      'currency',
    )
  })

  it('rejects a day that does not exist', () => {
    expect(validateSubscriptionForm({ ...valid, firstBillDate: '2026-02-31' })).toEqual({
      firstBillDate: 'Fecha de cobro inválida',
    })
  })

  it('does not crash on a half date (bug 3)', () => {
    expect(validateSubscriptionForm({ ...valid, endDate: '2026-10' })).toEqual({
      endDate: 'Fecha de fin de cobro inválida',
    })
  })

  it('needs the end after the first charge', () => {
    expect(validateSubscriptionForm({ ...valid, endDate: '2026-10-16' })).toHaveProperty(
      'endDate',
    )
    expect(validateSubscriptionForm({ ...valid, endDate: '2026-10-17' })).toEqual({})
  })

  it('needs the trial to end after it starts', () => {
    const trial = { startDate: '2026-10-16', endDate: '2026-10-16' }
    expect(validateSubscriptionForm({ ...valid, trial })).toHaveProperty('trial')
  })

  it.each([0, 1.5, Number.NaN])('rejects an interval of %d', (interval) => {
    const billingCycle = { type: 'every' as const, interval, unit: 'month' as const }
    expect(validateSubscriptionForm({ ...valid, billingCycle })).toHaveProperty(
      'billingCycle',
    )
  })
})
