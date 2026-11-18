import { describe, expect, it } from 'vitest'

import { backupSummary } from './backupSummary'
import type { Backup } from '../types'

// A backup whose subscriptions and categories states are whatever the test needs
function backupWith(subscriptionsState: unknown, categoriesState: unknown): Backup {
  return {
    app: 'aldia',
    format: 1,
    exportedOn: '2026-11-17',
    appVersion: '0.4.0',
    stores: {
      subscriptions: { state: subscriptionsState, version: 2 },
      categories: { state: categoriesState, version: 0 },
      settings: { state: {}, version: 0 },
    },
  }
}

const others = { id: 'others', name: 'Otros', color: '#8E9FAF' }
const gaming = { id: 'gaming', name: 'Juegos', color: '#C1569B' }
const gym = { id: 'custom-abc', name: 'Gimnasio', color: '#7C6BD6', isCustom: true }

describe('backupSummary', () => {
  it('counts the subscriptions and only the user’s own categories', () => {
    const backup = backupWith(
      { subscriptions: [{ id: 'a' }, { id: 'b' }, { id: 'c' }] },
      { categories: [others, gaming, gym] },
    )

    expect(backupSummary(backup)).toEqual({ subscriptions: 3, customCategories: 1 })
  })

  it('treats a custom- id as the user’s own even without the isCustom flag', () => {
    const backup = backupWith(
      { subscriptions: [] },
      { categories: [{ id: 'custom-old', name: 'Viejita', color: '#4A7FB5' }] },
    )

    expect(backupSummary(backup).customCategories).toBe(1)
  })

  it('says 0 for an empty app', () => {
    const backup = backupWith({ subscriptions: [] }, { categories: [others, gaming] })

    expect(backupSummary(backup)).toEqual({ subscriptions: 0, customCategories: 0 })
  })

  it('counts 0 instead of throwing when a list is missing or is not a list', () => {
    expect(backupSummary(backupWith({}, { categories: 'oops' }))).toEqual({
      subscriptions: 0,
      customCategories: 0,
    })
    expect(backupSummary(backupWith(null, [gym]))).toEqual({
      subscriptions: 0,
      customCategories: 0,
    })
  })

  it('skips entries in the categories list that are not objects', () => {
    const backup = backupWith({ subscriptions: [] }, { categories: [null, 'x', 4, gym] })

    expect(backupSummary(backup).customCategories).toBe(1)
  })
})
