const MONTHS = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
]

/**
 * A `YYYY-MM-DD` date in the short Spanish form used on cards and fields.
 * Returns `''` for an empty or malformed date.
 *
 * @example
 * formatDate('2026-10-16') // '16 Oct 26'
 */
export function formatDate(date: string) {
  const [year, month, day] = date.split('-')
  if (!year || !month || !day) return ''

  return `${day} ${MONTHS[parseInt(month, 10) - 1]} ${year.slice(2)}`
}
