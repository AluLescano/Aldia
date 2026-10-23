import { describe, expect, it } from 'vitest'

import { buildNotifications, PLANNING_DAYS } from './buildNotifications'
import { toISODate } from '@/shared/lib/isoDate'
import type { Subscription } from '@/shared/types'

// Oct 22, 2026 at 08:00, local time
const NOW = new Date(2026, 9, 22, 8, 0)

// Monthly on the 15th, one reminder 3 days before, unless a test says otherwise
const sub = (extra: Partial<Subscription> = {}): Subscription => ({
  id: 'netflix',
  name: 'Netflix',
  price: 10,
  currency: 'USD',
  billingCycle: { type: 'every', interval: 1, unit: 'month' },
  firstBillDate: '2026-01-15',
  categoryId: 'entertainment',
  reminders: [{ id: 'r3', daysBefore: 3, isEnabled: true }],
  isPaused: false,
  createdAt: '2026-01-15T00:00:00.000Z',
  ...extra,
})

// "YYYY-MM-DD HH:MM | title | body" for easy comparing
const summary = (notifications: ReturnType<typeof buildNotifications>) =>
  notifications.map(({ at, title, body }) => {
    const time = `${String(at.getHours()).padStart(2, '0')}:${String(at.getMinutes()).padStart(2, '0')}`
    return `${toISODate(at)} ${time} | ${title} | ${body}`
  })

describe('buildNotifications', () => {
  it('gives one notification per reminder day in the next 60 days, at the chosen time', () => {
    expect(summary(buildNotifications([sub()], NOW, '09:00'))).toEqual([
      '2026-11-12 09:00 | Netflix se cobra en 3 días | U$S 10,00 · 15 Nov',
      '2026-12-12 09:00 | Netflix se cobra en 3 días | U$S 10,00 · 15 Dic',
    ])
  })

  it('uses the date as the id', () => {
    expect(buildNotifications([sub()], NOW, '09:00')[0].id).toBe(20261112)
  })

  it.each([
    [1, 'Netflix se cobra mañana'],
    [0, 'Netflix se cobra hoy'],
  ])('says when for %d days before', (daysBefore, title) => {
    const one = sub({ reminders: [{ id: 'r', daysBefore, isEnabled: true }] })
    expect(buildNotifications([one], NOW, '09:00')[0].title).toBe(title)
  })

  it('talks about the trial on the charge that ends it', () => {
    const crunchyroll = sub({
      id: 'crunchyroll',
      name: 'Crunchyroll',
      price: 5,
      firstBillDate: '2026-11-19',
      trial: { startDate: '2026-10-20', endDate: '2026-11-19' },
      reminders: [{ id: 'r2', daysBefore: 2, isEnabled: true }],
    })
    const [first, second] = buildNotifications([crunchyroll], NOW, '09:00')
    expect(first).toMatchObject({
      title: 'Tu prueba de Crunchyroll termina en 2 días',
      body: 'Después se cobran U$S 5,00.',
    })
    expect(second.title).toBe('Crunchyroll se cobra en 2 días')
  })

  it('says when in the summary if they all charge the same day', () => {
    const spotify = sub({ id: 'spotify', name: 'Spotify', firstBillDate: '2026-02-15' })
    const [day] = buildNotifications([sub(), spotify], NOW, '09:00')
    expect(day).toMatchObject({
      title: '2 subscripciones se cobran en 3 días',
      body: 'Netflix (en 3 días), Spotify (en 3 días)',
    })
  })

  it('turns several subscriptions on one day into one summary', () => {
    const spotify = sub({ id: 'spotify', name: 'Spotify', firstBillDate: '2026-02-15' })
    const disney = sub({
      id: 'disney',
      name: 'Disney+',
      firstBillDate: '2026-02-12',
      reminders: [{ id: 'r0', daysBefore: 0, isEnabled: true }],
    })
    const [day] = buildNotifications([sub(), spotify, disney], NOW, '09:00')
    expect(day).toMatchObject({
      id: 20261112,
      title: '3 subscripciones se cobran pronto',
      body: 'Netflix (en 3 días), Spotify (en 3 días), Disney+ (hoy)',
    })
  })

  it('leaves out today when the time already passed', () => {
    // A reminder for today (charge on Oct 22, same day), but it's 10:00 and they ring at 09:00
    const today = sub({
      firstBillDate: '2026-01-22',
      reminders: [{ id: 'r0', daysBefore: 0, isEnabled: true }],
    })
    const late = new Date(2026, 9, 22, 10, 0)
    expect(buildNotifications([today], late, '09:00').map((n) => n.id)).not.toContain(
      20261022,
    )
    expect(buildNotifications([today], NOW, '09:00')[0].id).toBe(20261022)
  })

  it('stays inside the planning window', () => {
    const daily = sub({
      billingCycle: { type: 'every', interval: 1, unit: 'day' },
      reminders: [{ id: 'r0', daysBefore: 0, isEnabled: true }],
    })
    const notifications = buildNotifications([daily], NOW, '09:00')
    expect(notifications).toHaveLength(PLANNING_DAYS + 1) // today through day 60
  })

  it('gives nothing for paused subscriptions or no subscriptions', () => {
    expect(buildNotifications([sub({ isPaused: true })], NOW, '09:00')).toEqual([])
    expect(buildNotifications([], NOW, '09:00')).toEqual([])
  })
})
