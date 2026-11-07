import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { newSubscriptionValues } from './newSubscriptionValues'
import type { Category, Preset } from '@/shared/types'

const categories: Category[] = [
  { id: 'entertainment', name: 'Entretenimiento', color: '#000000' },
  { id: 'others', name: 'Otros', color: '#000000' },
]

const netflix: Preset = {
  id: 'netflix',
  name: 'Netflix',
  defaultCategoryId: 'entertainment',
  iconUrl: '/logos/logo_netflix.webp',
}

describe('newSubscriptionValues', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 10, 7, 12)) // Nov 7, 2026, local noon
  })
  afterEach(() => vi.useRealTimers())

  it('starts on today when no date is given (adding from Home)', () => {
    expect(newSubscriptionValues(netflix, 'USD', categories).firstBillDate).toBe(
      '2026-11-07',
    )
  })

  it('starts on the given date (adding from a Calendario day)', () => {
    const values = newSubscriptionValues(netflix, 'USD', categories, '2026-11-15')
    expect(values.firstBillDate).toBe('2026-11-15')
  })

  it('takes the date for a custom subscription too', () => {
    const values = newSubscriptionValues(undefined, 'ARS', categories, '2026-12-01')
    expect(values).toMatchObject({
      name: '',
      currency: 'ARS',
      firstBillDate: '2026-12-01',
      categoryId: 'others',
    })
  })

  it('fills the name, category and logo from a preset', () => {
    expect(newSubscriptionValues(netflix, 'USD', categories)).toMatchObject({
      name: 'Netflix',
      price: '',
      categoryId: 'entertainment',
      icon: { kind: 'preset', path: '/logos/logo_netflix.webp' },
      billingCycle: { type: 'every', interval: 1, unit: 'month' },
    })
  })

  it('falls back to "Otros" when the preset’s category was deleted', () => {
    const onlyOthers = categories.filter((category) => category.id === 'others')
    expect(newSubscriptionValues(netflix, 'USD', onlyOthers).categoryId).toBe('others')
  })
})
