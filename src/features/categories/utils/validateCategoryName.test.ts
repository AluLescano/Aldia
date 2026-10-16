import { describe, expect, it } from 'vitest'

import { validateCategoryName } from './validateCategoryName'
import type { Category } from '@/shared/types'

const categories: Category[] = [
  { id: 'music', name: 'Música', color: '#000' },
  { id: 'others', name: 'Otros', color: '#000' },
]

describe('validateCategoryName', () => {
  it('accepts a new name', () => {
    expect(validateCategoryName('Gimnasio', categories)).toBeNull()
  })

  it('requires some text', () => {
    expect(validateCategoryName('   ', categories)).toBe('Ingrese un nombre')
  })

  it('limits the length to 24', () => {
    expect(validateCategoryName('x'.repeat(25), categories)).toBe('Máximo 24 caracteres')
  })

  it('finds a clash ignoring case, accents and spaces', () => {
    expect(validateCategoryName('  musica ', categories)).toBe(
      'Ya existe la categoría «Música»',
    )
  })

  it('lets a category keep its own name when renaming', () => {
    expect(validateCategoryName('Música', categories, 'music')).toBeNull()
  })
})
