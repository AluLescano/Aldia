// UTILS
import { normalizeText } from '@/shared/lib/normalizeText'

// TYPES
import type { Category } from '@/shared/types'

/**
 * Checks a category name: not empty, at most 24 characters, and not taken
 * (ignoring case, accents and extra spaces: "Música" clashes with "musica").
 *
 * @param ignoreId when renaming, the category being renamed, so it doesn't clash with itself.
 * @returns a Spanish error message, or `null` when the name is valid.
 */
export function validateCategoryName(
  name: string,
  categories: Category[],
  ignoreId?: string,
): string | null {
  const trimmed = name.trim()
  if (trimmed.length === 0) return 'Ingrese un nombre'
  if (trimmed.length > 24) return 'Máximo 24 caracteres'

  const clash = categories.find(
    (category) =>
      category.id !== ignoreId && normalizeText(category.name) === normalizeText(trimmed),
  )
  if (clash) return `Ya existe la categoría «${clash.name}»`

  return null
}
