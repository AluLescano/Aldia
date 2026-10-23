import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { Subscription } from '@/shared/types'
import type * as NotificationSync from './notificationSync'

/*
 * Fakes for everything that talks to the phone. `calls` records what the plugin was asked to
 * do, in order, so the tests can check the sequence (permission → cancel → schedule).
 */
const phone = vi.hoisted(() => ({
  native: true,
  permission: 'granted' as string,
  pending: [] as { id: number }[],
  calls: [] as string[],
  scheduled: [] as { id: number; isExactNotification?: boolean; schedule?: object }[],
  appListener: undefined as undefined | ((state: { isActive: boolean }) => void),
}))

vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: () => phone.native },
}))

vi.mock('@capacitor/app', () => ({
  App: {
    addListener: (_: string, listener: (state: { isActive: boolean }) => void) => {
      phone.appListener = listener
    },
  },
}))

vi.mock('@capacitor/local-notifications', () => ({
  LocalNotifications: {
    checkPermissions: async () => {
      phone.calls.push('checkPermissions')
      return { display: phone.permission }
    },
    // The user's answer to the pop-up is whatever `phone.permission` says
    requestPermissions: async () => {
      phone.calls.push('requestPermissions')
      return { display: phone.permission }
    },
    createChannel: async () => {
      phone.calls.push('createChannel')
    },
    getPending: async () => {
      phone.calls.push('getPending')
      return { notifications: phone.pending }
    },
    cancel: async ({ notifications }: { notifications: { id: number }[] }) => {
      phone.calls.push(`cancel ${notifications.length}`)
    },
    schedule: async ({ notifications }: { notifications: typeof phone.scheduled }) => {
      phone.calls.push(`schedule ${notifications.length}`)
      phone.scheduled = notifications
    },
  },
}))

// The stores save through fileStorage, which needs the phone too
vi.mock('@/shared/lib/fileStorage', () => ({
  fileStorage: {
    getItem: async () => null,
    setItem: async () => {},
    removeItem: async () => {},
  },
}))

// Monthly on the 15th with a reminder 3 days before: about 2 notifications in 60 days
const netflix: Subscription = {
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
}

let sync: typeof NotificationSync

beforeEach(async () => {
  Object.assign(phone, {
    native: true,
    permission: 'granted',
    pending: [],
    calls: [],
    scheduled: [],
    appListener: undefined,
  })
  // The module keeps its channel flag and queue in memory: a fresh copy per test
  vi.resetModules()
  sync = await import('./notificationSync')
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
  vi.setSystemTime(new Date(2026, 9, 22, 8, 0))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('syncNotifications', () => {
  it('checks permission, cancels what was pending, then schedules the fresh list', async () => {
    phone.pending = [{ id: 1 }, { id: 2 }, { id: 3 }]
    await sync.syncNotifications([netflix], '09:00')
    expect(phone.calls).toEqual([
      'checkPermissions',
      'createChannel',
      'getPending',
      'cancel 3',
      'schedule 2',
    ])
  })

  it('schedules inexact notifications that can ring while the phone is idle', async () => {
    await sync.syncNotifications([netflix], '09:00')
    expect(phone.scheduled[0]).toMatchObject({
      id: 20261112,
      isExactNotification: false,
      schedule: { allowWhileIdle: true },
    })
  })

  it('does nothing in the browser', async () => {
    phone.native = false
    await sync.syncNotifications([netflix], '09:00')
    expect(phone.calls).toEqual([])
  })

  it('does nothing until the user allows notifications (never triggers the prompt)', async () => {
    phone.permission = 'prompt'
    await sync.syncNotifications([netflix], '09:00')
    expect(phone.calls).toEqual(['checkPermissions'])
  })

  it('only cancels when there is nothing left to schedule', async () => {
    phone.pending = [{ id: 1 }]
    await sync.syncNotifications([], '09:00')
    expect(phone.calls.at(-1)).toBe('cancel 1')
    expect(phone.calls.some((call) => call.startsWith('schedule'))).toBe(false)
  })

  it('creates the channel only once', async () => {
    await sync.syncNotifications([netflix], '09:00')
    await sync.syncNotifications([netflix], '09:00')
    expect(phone.calls.filter((call) => call === 'createChannel')).toHaveLength(1)
  })
})

describe('startNotificationSync', () => {
  // Lets the queued promises finish
  const settle = () => vi.advanceTimersByTimeAsync(0)

  it('syncs once right away', async () => {
    sync.startNotificationSync()
    await settle()
    expect(phone.calls.filter((call) => call === 'checkPermissions')).toHaveLength(1)
  })

  it('syncs once after a burst of subscription changes', async () => {
    const { useSubscriptionStore } =
      await import('@/features/subscriptions/store/subscriptionStore')
    sync.startNotificationSync()
    await settle()
    phone.calls = []

    useSubscriptionStore.getState().addSubscription(netflix)
    useSubscriptionStore.getState().updateSubscription('netflix', { price: 12 })
    useSubscriptionStore.getState().updateSubscription('netflix', { price: 15 })
    await vi.advanceTimersByTimeAsync(999)
    expect(phone.calls).toEqual([]) // still waiting

    await vi.advanceTimersByTimeAsync(1)
    expect(phone.calls.filter((call) => call === 'checkPermissions')).toHaveLength(1)
  })

  it('syncs when the reminder time changes', async () => {
    const { useSettingsStore } = await import('@/features/settings/store/settingsStore')
    sync.startNotificationSync()
    await settle()
    phone.calls = []

    useSettingsStore.getState().setReminderTime('20:00')
    await vi.advanceTimersByTimeAsync(1000)
    expect(phone.calls).toContain('checkPermissions')
  })

  it('syncs when the app comes back to the screen, not when it leaves', async () => {
    sync.startNotificationSync()
    await settle()
    phone.calls = []

    phone.appListener?.({ isActive: false })
    await vi.advanceTimersByTimeAsync(1000)
    expect(phone.calls).toEqual([])

    phone.appListener?.({ isActive: true })
    await vi.advanceTimersByTimeAsync(1000)
    expect(phone.calls).toContain('checkPermissions')
  })

  it('keeps the app running when the phone refuses', async () => {
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    vi.spyOn(LocalNotifications, 'checkPermissions').mockRejectedValueOnce(
      new Error('nope'),
    )

    sync.startNotificationSync()
    await settle()
    expect(errorLog).toHaveBeenCalled()
    errorLog.mockRestore()
  })
})

describe('requestNotificationPermission', () => {
  const settle = () => vi.advanceTimersByTimeAsync(0)

  it('says no in the browser, without asking', async () => {
    phone.native = false
    expect(await sync.requestNotificationPermission()).toBe(false)
    expect(phone.calls).toEqual([])
  })

  it('schedules right away when the user says yes', async () => {
    const { useSubscriptionStore } =
      await import('@/features/subscriptions/store/subscriptionStore')
    useSubscriptionStore.setState({ subscriptions: [netflix] })

    expect(await sync.requestNotificationPermission()).toBe(true)
    await settle() // no 1-second wait: the sync is already queued
    expect(phone.calls[0]).toBe('requestPermissions')
    expect(phone.calls.at(-1)).toBe('schedule 2')
  })

  it.each(['denied', 'prompt-with-rationale'])(
    'schedules nothing when the answer is %s',
    async (answer) => {
      phone.permission = answer
      expect(await sync.requestNotificationPermission()).toBe(false)
      await vi.advanceTimersByTimeAsync(1000)
      expect(phone.calls).toEqual(['requestPermissions'])
    },
  )
})

describe('hasNotificationPermission', () => {
  it('only looks: true when allowed, never shows the pop-up', async () => {
    expect(await sync.hasNotificationPermission()).toBe(true)
    expect(phone.calls).toEqual(['checkPermissions'])
  })

  it.each(['prompt', 'denied'])('is false when the permission is %s', async (state) => {
    phone.permission = state
    expect(await sync.hasNotificationPermission()).toBe(false)
  })

  it('is false in the browser, without asking the plugin', async () => {
    phone.native = false
    expect(await sync.hasNotificationPermission()).toBe(false)
    expect(phone.calls).toEqual([])
  })
})
