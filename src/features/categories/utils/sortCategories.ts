// STORES
import { OTHERS_ID } from '../store/categoryStore'

// TYPES
import type { Category } from '@/shared/types'

/**
 * The categories as the picker lists them: A-Z by name (ignoring accents and case), with
 * "Otros" always last, so a new custom one lands in its spot instead of after "Otros".
 * The store keeps creation order; this only changes how they're shown. Returns a new array.
 *
 * @example
 * sortCategories([otros, juegos, ia]) // [ia, juegos, otros]
 */
export function sortCategories(categories: Category[]): Category[] {
  return [...categories].sort((a, b) => {
    if (a.id === OTHERS_ID) return 1
    if (b.id === OTHERS_ID) return -1
    return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
  })
}
