import { describe, expect, it } from 'vitest'

import {
  filterKey,
  filterSubscriptions,
  listFilters,
  sortSubscriptions,
} from './subscriptionList'
import type { Subscription } from '@/shared/types'

const sub = (name: string, status: Subscription['status'], categoryId: string) =>
  ({ name, status, categoryId }) as Subscription

const list = [
  sub('Zeta', 'active', 'ai'),
  sub('alfa', 'inactive', 'ai'),
  sub('Beta', 'trial', 'gaming'),
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
    const noPaused = list.filter((s) => s.status !== 'inactive')
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
  it('puts paused last, the rest alphabetically', () => {
    expect(sortSubscriptions(list).map((s) => s.name)).toEqual(['Beta', 'Zeta', 'alfa'])
  })

  it('does not change the original array', () => {
    const copy = [...list]
    sortSubscriptions(list)
    expect(list).toEqual(copy)
  })
})
