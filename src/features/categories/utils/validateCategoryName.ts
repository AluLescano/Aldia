import { normalizeText } from '@/shared/lib/normalizeText'
import type { Category } from '@/shared/types'

export function validateCategoryName(
  name: string,
  categories: Category[],
  ignoreId?: string, // when renaming, a category must not clash with itself
): string | null {
  const trimmed = name.trim()
  if (trimmed.length === 0) return 'Ingrese un nombre'
  if (trimmed.length > 24) return 'Máximo 24 caracteres'

  const clash = categories.find(
    (category) =>
      category.id !== ignoreId && normalizeText(category.name) === normalizeText(trimmed),
  )
  if (clash) return `Ya existe la categoría «${clash.name}»`

  return null // null means valid
}