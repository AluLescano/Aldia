import { describe, expect, it, vi } from 'vitest'

import { sortCategories } from './sortCategories'
import type { Category } from '@/shared/types'

// categoryStore (where OTHERS_ID lives) loads fileStorage, which needs the Capacitor plugin
vi.mock('@/shared/lib/fileStorage', () => ({
  fileStorage: {
    getItem: async () => null,
    setItem: async () => {},
    removeItem: async () => {},
  },
}))

const category = (id: string, name: string): Category => ({ id, name, color: '#000000' })

const names = (categories: Category[]) => categories.map((c) => c.name)

describe('sortCategories', () => {
  it('puts them A-Z with Otros last', () => {
    const list = [
      category('others', 'Otros'),
      category('gaming', 'Juegos'),
      category('ai', 'IA'),
      category('bills', 'Servicios'),
    ]

    expect(names(sortCategories(list))).toEqual(['IA', 'Juegos', 'Servicios', 'Otros'])
  })

  it('places a new custom category in its spot, not after Otros', () => {
    const list = [
      category('ai', 'IA'),
      category('others', 'Otros'),
      category('custom-1', 'Gimnasio'),
    ]

    expect(names(sortCategories(list))).toEqual(['Gimnasio', 'IA', 'Otros'])
  })

  it('ignores accents and case', () => {
    const list = [
      category('custom-1', 'zapatos'),
      category('custom-2', 'Álbumes'),
      category('custom-3', 'auto'),
    ]

    expect(names(sortCategories(list))).toEqual(['Álbumes', 'auto', 'zapatos'])
  })

  it('keeps Otros last even when it was renamed by an old version', () => {
    const list = [category('others', 'Aaa'), category('ai', 'IA')]

    expect(names(sortCategories(list))).toEqual(['IA', 'Aaa'])
  })

  it('does not change the list it gets', () => {
    const list = [category('others', 'Otros'), category('ai', 'IA')]
    sortCategories(list)

    expect(names(list)).toEqual(['Otros', 'IA'])
  })
})
