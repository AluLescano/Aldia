import { toISODate } from "./isoDate"

export function getMonthGrid(year: number, month: number) {
    const calendar: string[] = []
    const offset = new Date(year, month, 1).getDay()
    for (let i = 0; i < 42; i++) {
        const date = toISODate(new Date(year, month, 1 - offset + i))
        calendar.push(date)
    }
    return calendar
}