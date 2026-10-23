/**
 * A typed whole number, if it's inside the range: null while the text is empty, has
 * decimals, or falls outside it. For number fields, where the text can be half-typed.
 *
 * @example
 * parseInRange('7', 1) // 7
 * parseInRange('', 1) // null
 * parseInRange('40', 0, 30) // null
 */
export const parseInRange = (text: string, min: number, max = Infinity) => {
  const value = Number(text)
  return text !== '' && Number.isInteger(value) && value >= min && value <= max
    ? value
    : null
}
