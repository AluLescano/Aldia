/**
 * How many charges, in words: the tiles' screen-reader labels and the month total's line.
 *
 * @example
 * countText(0) // 'Sin cobros'
 * countText(1) // '1 cobro'
 * countText(3) // '3 cobros'
 */
export const countText = (count: number) =>
  count === 0 ? 'Sin cobros' : `${count} ${count === 1 ? 'cobro' : 'cobros'}`

/**
 * A day in a few words: its charges, plus its free trials when there are any. The day
 * sheet's subtitle.
 *
 * @example
 * daySummary(3, 0) // '3 cobros'
 * daySummary(0, 1) // '1 prueba gratis'
 * daySummary(2, 2) // '2 cobros · 2 pruebas gratis'
 */
export function daySummary(charges: number, trials: number): string {
  if (trials === 0) return countText(charges)
  const trialText = trials === 1 ? '1 prueba gratis' : `${trials} pruebas gratis`
  return charges === 0 ? trialText : `${countText(charges)} · ${trialText}`
}
