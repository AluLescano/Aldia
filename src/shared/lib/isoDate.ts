export function parseISODate(date: string) {
  const [year, month, day] = date.split('-')
  if (!year || !month || !day) return null
  const newDate = new Date(Number(year), Number(month)-1, Number(day))
  return newDate
}


export function toISODate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function todayISO() {
    const currentDate = new Date()
    return toISODate(currentDate)
}
export function daysBetween(from: string, to: string) {
  const start = parseISODate(from)
  const end = parseISODate(to)
  if (!start || !end) return 0
  // Math.round absorbs the 1 hour shift of daylight saving
  return Math.round((end.getTime() - start.getTime()) / 86_400_000)
}
