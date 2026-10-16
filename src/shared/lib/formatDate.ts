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

export function formatDate(date: string) {
  const [year, month, day] = date.split('-')
  if (!year || !month || !day) return ''

  return `${day} ${MONTHS[parseInt(month, 10) - 1]} ${year.slice(2)}`
}
