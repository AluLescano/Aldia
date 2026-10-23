import type { Subscription } from '@/shared/types'

/** Which subscriptions the Home list shows. */
export type ListFilter =
  { type: 'all' } | { type: 'inactive' } | { type: 'category'; categoryId: string }

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

/** Paused subscriptions go last; inside each group, alphabetical. Returns a new array. */
export function sortSubscriptions(subscriptions: Subscription[]): Subscription[] {
  return [...subscriptions].sort((a, b) => {
    if (a.isPaused !== b.isPaused) return a.isPaused ? 1 : -1
    return a.name.localeCompare(b.name)
  })
}
