import type { CurrencyCode, Subscription } from '@/shared/types'
import { nextBillDate } from './billingCycle'
import { convert, type ExchangeRates } from '@/shared/lib/exchangeRates'
import { monthlyEquivalent } from './monthlyTotal'

/** Which subscriptions the Home list shows. */
export type ListFilter =
  { type: 'all' } | { type: 'inactive' } | { type: 'category'; categoryId: string }

/** How the Home list is ordered. */
export type ListSort =
  'next-charge' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc'

/** A stable string per filter, for React keys and for comparing two filters. */
export const filterKey = (filter: ListFilter) =>
  filter.type === 'category' ? `category:${filter.categoryId}` : filter.type

/**
 * The filter tabs for a list: "all", one per category in use, and "inactive" only
 * when at least one subscription is paused. No tab ever leads to an empty list.
 */
export function listFilters(subscriptions: Subscription[]): ListFilter[] {
  const categoryIds = [...new Set(subscriptions.map((sub) => sub.categoryId))]
  const hasPaused = subscriptions.some((sub) => sub.isPaused)
  return [
    { type: 'all' },
    ...categoryIds.map((categoryId) => ({ type: 'category' as const, categoryId })),
    ...(hasPaused ? [{ type: 'inactive' as const }] : []),
  ]
}

/** Keeps the subscriptions that match the filter. */
export function filterSubscriptions(
  subscriptions: Subscription[],
  filter: ListFilter,
): Subscription[] {
  switch (filter.type) {
    case 'all':
      return subscriptions
    case 'inactive':
      return subscriptions.filter((sub) => sub.isPaused)
    case 'category':
      return subscriptions.filter((sub) => sub.categoryId === filter.categoryId)
  }
}

/** What the sorts need besides the list itself. Pass `todayISO()` as `today`. */
export interface SortContext {
  today: string
  currency: CurrencyCode
  rates: ExchangeRates | null
}

/**
 * Orders the list by `sort`. Paused subscriptions always go last, sorted the same way among
 * themselves; ties fall back to A-Z so the order never jumps around. Returns a new array.
 *
 * @example
 * sortSubscriptions(subs, 'next-charge', { today: todayISO(), currency, rates })
 */
export function sortSubscriptions(
  subscriptions: Subscription[],
  sort: ListSort,
  context: SortContext,
): Subscription[] {
  const nextCharge = (sub: Subscription) =>
    nextBillDate(sub.firstBillDate, sub.billingCycle, context.today)

  const byName = (subA: Subscription, subB: Subscription) =>
    subA.name.localeCompare(subB.name)

  const monthlyPrice = (sub: Subscription) =>
    convert(
      monthlyEquivalent(sub.price, sub.billingCycle),
      sub.currency,
      context.currency,
      context.rates,
    )

  /** Cheapest first (`direction` 1) or priciest first (-1). No price (no rate) goes after the rest either way. */
  const byPrice = (subA: Subscription, subB: Subscription, direction: 1 | -1) => {
    const priceA = monthlyPrice(subA)
    const priceB = monthlyPrice(subB)
    if (priceA === null && priceB === null) return byName(subA, subB)
    if (priceA === null) return 1 // a has no price: a goes after
    if (priceB === null) return -1 // b has no price: b goes after
    return (priceA - priceB) * direction || byName(subA, subB)
  }

  return [...subscriptions].sort((a, b) => {
    if (a.isPaused !== b.isPaused) return a.isPaused ? 1 : -1
    switch (sort) {
      case 'name-asc':
        return byName(a, b)
      case 'name-desc':
        return byName(b, a)
      case 'next-charge':
        return nextCharge(a).localeCompare(nextCharge(b)) || byName(a, b)
      case 'price-asc':
        return byPrice(a, b, 1)
      case 'price-desc':
        return byPrice(a, b, -1)
    }
  })
}
