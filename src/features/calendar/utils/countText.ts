/**
 * How many charges, in words: the day sheet's subtitle, the tiles' screen-reader labels and
 * the month total's line.
 *
 * @example
 * countText(0) // 'Sin cobros'
 * countText(1) // '1 cobro'
 * countText(3) // '3 cobros'
 */
export const countText = (count: number) =>
  count === 0 ? 'Sin cobros' : `${count} ${count === 1 ? 'cobro' : 'cobros'}`
