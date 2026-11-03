import { describe, expect, it } from 'vitest'

import {
  filterKey,
  filterSubscriptions,
  listFilters,
  sortSubscriptions,
  type SortContext,
} from './subscriptionList'
import type { Subscription } from '@/shared/types'

const sub = (name: string, isPaused: boolean, categoryId: string) =>
  ({ name, isPaused, categoryId }) as Subscription

const list = [
  sub('Zeta', false, 'ai'),
  sub('alfa', true, 'ai'),
  sub('Beta', false, 'gaming'),
]

describe('listFilters', () => {
  it('has all, one tab per category in use, and inactive', () => {
    expect(listFilters(list).map(filterKey)).toEqual([
      'all',
      'category:ai',
      'category:gaming',
      'inactive',
    ])
  })

  it('hides "inactive" when nothing is paused', () => {
    const noPaused = list.filter((s) => !s.isPaused)
    expect(listFilters(noPaused).map(filterKey)).not.toContain('inactive')
  })
})

describe('filterSubscriptions', () => {
  it('keeps one category', () => {
    const ai = filterSubscriptions(list, { type: 'category', categoryId: 'ai' })
    expect(ai.map((s) => s.name)).toEqual(['Zeta', 'alfa'])
  })

  it('keeps the paused ones', () => {
    expect(filterSubscriptions(list, { type: 'inactive' }).map((s) => s.name)).toEqual([
      'alfa',
    ])
  })

  it('keeps everything for "all"', () => {
    expect(filterSubscriptions(list, { type: 'all' })).toHaveLength(3)
  })
})

describe('sortSubscriptions', () => {
  const context: SortContext = { today: '2026-11-03', currency: 'USD', rates: null }
  const names = (subs: Subscription[]) => subs.map((s) => s.name)

  it('name-asc: paused last, the rest A-Z', () => {
    expect(names(sortSubscriptions(list, 'name-asc', context))).toEqual([
      'Beta',
      'Zeta',
      'alfa',
    ])
  })

  it('name-desc: paused still last, the rest Z-A', () => {
    expect(names(sortSubscriptions(list, 'name-desc', context))).toEqual([
      'Zeta',
      'Beta',
      'alfa',
    ])
  })

  it('name sorts ignore upper and lower case', () => {
    const mixed = [
      sub('beta', false, 'ai'),
      sub('Alfa', false, 'ai'),
      sub('Gamma', false, 'ai'),
    ]
    expect(names(sortSubscriptions(mixed, 'name-asc', context))).toEqual([
      'Alfa',
      'beta',
      'Gamma',
    ])
  })

  it('sorts the paused ones among themselves too', () => {
    const paused = [
      sub('Zeta', true, 'ai'),
      sub('Alfa', true, 'ai'),
      sub('Beta', false, 'ai'),
    ]
    expect(names(sortSubscriptions(paused, 'name-asc', context))).toEqual([
      'Beta',
      'Alfa',
      'Zeta',
    ])
  })

  // Monthly, first charged on `firstBillDate`; today is Nov 3
  const charged = (name: string, firstBillDate: string, isPaused = false) =>
    ({
      name,
      isPaused,
      firstBillDate,
      billingCycle: { type: 'every', interval: 1, unit: 'month' },
    }) as Subscription

  it('next-charge: the soonest charge first, counting today', () => {
    const subs = [
      charged('Noviembre 20', '2026-11-20'),
      charged('Diciembre 1', '2026-10-01'), // Oct 1 and Nov 1 passed, so next is Dec 1
      charged('Hoy', '2026-09-03'), // charged today (Nov 3)
    ]
    expect(names(sortSubscriptions(subs, 'next-charge', context))).toEqual([
      'Hoy',
      'Noviembre 20',
      'Diciembre 1',
    ])
  })

  it('next-charge: same day falls back to A-Z', () => {
    const subs = [charged('Zeta', '2026-11-10'), charged('Alfa', '2026-10-10')]
    expect(names(sortSubscriptions(subs, 'next-charge', context))).toEqual([
      'Alfa',
      'Zeta',
    ])
  })

  it('next-charge: paused last, even when charged sooner', () => {
    const subs = [charged('Pausada', '2026-11-04', true), charged('Activa', '2026-11-30')]
    expect(names(sortSubscriptions(subs, 'next-charge', context))).toEqual([
      'Activa',
      'Pausada',
    ])
  })

  // Rates are units per 1 USD: 1 USD = 1000 ARS
  const rates = { date: '2026-11-03', rates: { USD: 1, ARS: 1000 } }
  const withRates: SortContext = { ...context, rates }
  const priced = (
    name: string,
    price: number,
    currency: string,
    unit: 'month' | 'year' = 'month',
    isPaused = false,
  ) =>
    ({
      name,
      price,
      currency,
      isPaused,
      billingCycle: { type: 'every', interval: 1, unit },
    }) as Subscription

  const prices = [
    priced('Quince', 15, 'USD'),
    priced('Anual', 120, 'USD', 'year'), // 10 a month
    priced('Pesos', 9000, 'ARS'), // 9 USD a month
  ]

  it('price-asc: cheapest per month first, converted to the Home currency', () => {
    expect(names(sortSubscriptions(prices, 'price-asc', withRates))).toEqual([
      'Pesos',
      'Anual',
      'Quince',
    ])
  })

  it('price-desc: priciest per month first', () => {
    expect(names(sortSubscriptions(prices, 'price-desc', withRates))).toEqual([
      'Quince',
      'Anual',
      'Pesos',
    ])
  })

  it('price: same price falls back to A-Z in both directions', () => {
    const same = [priced('Zeta', 10, 'USD'), priced('Alfa', 10, 'USD')]
    expect(names(sortSubscriptions(same, 'price-asc', withRates))).toEqual([
      'Alfa',
      'Zeta',
    ])
    expect(names(sortSubscriptions(same, 'price-desc', withRates))).toEqual([
      'Alfa',
      'Zeta',
    ])
  })

  // No rates yet (first open offline): the ARS one can't be converted to USD
  const noRate = [
    priced('Pausada', 1, 'USD', 'month', true),
    priced('Sin tasa', 9000, 'ARS'),
    priced('Cara', 50, 'USD'),
    priced('Barata', 5, 'USD'),
  ]

  it('price-asc: no rate goes after the priced ones, paused still last', () => {
    expect(names(sortSubscriptions(noRate, 'price-asc', context))).toEqual([
      'Barata',
      'Cara',
      'Sin tasa',
      'Pausada',
    ])
  })

  it('price-desc: no rate still goes after the priced ones, not first', () => {
    expect(names(sortSubscriptions(noRate, 'price-desc', context))).toEqual([
      'Cara',
      'Barata',
      'Sin tasa',
      'Pausada',
    ])
  })

  it('price: several without a rate are A-Z among themselves', () => {
    const none = [priced('Zeta', 1, 'ARS'), priced('Alfa', 2, 'ARS')]
    expect(names(sortSubscriptions(none, 'price-desc', context))).toEqual([
      'Alfa',
      'Zeta',
    ])
  })

  it('does not change the original array', () => {
    const copy = [...list]
    sortSubscriptions(list, 'name-desc', context)
    expect(list).toEqual(copy)
  })
})
