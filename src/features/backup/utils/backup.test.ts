import { describe, expect, it } from 'vitest'

import { backupFileName, createBackup, isSavedStore, readBackup } from './backup'
import type { Backup } from '../types'

const NOT_OURS = 'Este archivo no es un backup de Aldia.'
const BROKEN = 'El backup está incompleto o dañado.'
const NEWER =
  'Este backup es de una versión más nueva de Aldia. Actualiza la app para importarlo.'

// The versions this app's stores are on today
const CURRENT = { subscriptions: 3, categories: 0, settings: 0 }

// Three stores as persist saves them; categories and settings are on version 0
const STORES: Backup['stores'] = {
  subscriptions: { state: { subscriptions: [] }, version: 3 },
  categories: { state: { categories: [] }, version: 0 },
  settings: { state: { selectedCurrency: 'ARS' }, version: 0 },
}

const VALID = createBackup(STORES, '0.4.0', '2026-11-15')

// A valid backup as text, with some fields changed (or removed with `undefined`)
const fileWith = (changes: Record<string, unknown>) =>
  JSON.stringify({ ...VALID, ...changes })

const storesWith = (changes: Record<string, unknown>) =>
  fileWith({ stores: { ...STORES, ...changes } })

describe('isSavedStore', () => {
  it.each([
    ['a store', { state: {}, version: 2 }],
    ['version 0 (categories and settings)', { state: {}, version: 0 }],
  ])('accepts %s', (_, value) => {
    expect(isSavedStore(value)).toBe(true)
  })

  it.each([
    ['null', null],
    ['text', 'hello'],
    ['a number', 2],
    ['no state', { version: 2 }],
    ['a null state', { state: null, version: 2 }],
    ['a text state', { state: 'x', version: 2 }],
    ['no version', { state: {} }],
    ['a text version', { state: {}, version: '2' }],
  ])('refuses %s', (_, value) => {
    expect(isSavedStore(value)).toBe(false)
  })
})

describe('createBackup', () => {
  it('labels the stores as an Aldia backup', () => {
    expect(createBackup(STORES, '0.4.0', '2026-11-15')).toEqual({
      app: 'aldia',
      format: 1,
      exportedOn: '2026-11-15',
      appVersion: '0.4.0',
      stores: STORES,
    })
  })
})

describe('backupFileName', () => {
  it('puts the day in the name', () => {
    expect(backupFileName('2026-11-15')).toBe('aldia-backup-2026-11-15.json')
  })
})

describe('readBackup', () => {
  it('accepts its own backup, unchanged', () => {
    expect(readBackup(JSON.stringify(VALID), CURRENT)).toEqual({
      worked: true,
      backup: VALID,
    })
  })

  it('accepts stores older than the app (their migrate upgrades them)', () => {
    const old = storesWith({ subscriptions: { state: {}, version: 2 } })
    expect(readBackup(old, CURRENT).worked).toBe(true)
  })

  it.each([
    ['broken JSON', '{ "app": "aldia", '],
    ['an empty file', ''],
    ['JSON that is not an object', '"aldia"'],
    ['null', 'null'],
    ['a list', '[]'],
    ['another app', fileWith({ app: 'tilla' })],
    ['no app', fileWith({ app: undefined })],
    ['another format', fileWith({ format: 2 })],
    ['the format as text', fileWith({ format: '1' })],
    ['no exportedOn', fileWith({ exportedOn: undefined })],
    ['exportedOn as a number', fileWith({ exportedOn: 20261115 })],
    ['no appVersion', fileWith({ appVersion: undefined })],
    ['appVersion as a number', fileWith({ appVersion: 4 })],
  ])('refuses %s as not ours', (_, text) => {
    expect(readBackup(text, CURRENT)).toEqual({ worked: false, reason: NOT_OURS })
  })

  it.each([
    ['no stores', fileWith({ stores: undefined })],
    ['null stores', fileWith({ stores: null })],
    ['stores as text', fileWith({ stores: 'all of them' })],
    ['a missing store', storesWith({ settings: undefined })],
    ['a store with no version', storesWith({ categories: { state: {} } })],
    [
      'a store with a text state',
      storesWith({ subscriptions: { state: 'x', version: 2 } }),
    ],
  ])('refuses %s as broken', (_, text) => {
    expect(readBackup(text, CURRENT)).toEqual({ worked: false, reason: BROKEN })
  })

  it.each([
    ['subscriptions', storesWith({ subscriptions: { state: {}, version: 4 } })],
    ['categories', storesWith({ categories: { state: {}, version: 1 } })],
    ['settings', storesWith({ settings: { state: {}, version: 1 } })],
  ])('refuses %s saved by a newer app', (_, text) => {
    expect(readBackup(text, CURRENT)).toEqual({ worked: false, reason: NEWER })
  })

  it('checks every store, not just the first one', () => {
    // Only the last store is broken: a loop that stopped early would let it through
    const lastBroken = storesWith({ settings: { state: {}, version: 'x' } })
    expect(readBackup(lastBroken, CURRENT).worked).toBe(false)
  })
})
