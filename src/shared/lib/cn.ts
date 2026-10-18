/** What `cn` accepts: a class name, or the falsy result of `isOpen && styles.open`. */
export type ClassValue = string | false | undefined | null

/**
 * Joins the class names that are set, skipping false, null, undefined and ''.
 *
 * @example
 * cn(styles.row, isSelected && styles.selected) // "row selected" or "row"
 */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ')
}
