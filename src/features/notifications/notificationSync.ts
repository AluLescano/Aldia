// DEPENDENCIES
import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'
import { LocalNotifications } from '@capacitor/local-notifications'

// STORES
import { useSubscriptionStore } from '@/features/subscriptions/store/subscriptionStore'
import { useSettingsStore } from '@/features/settings/store/settingsStore'

// UTILS
import { buildNotifications } from './utils/buildNotifications'

// TYPES
import type { Subscription } from '@/shared/types'

/** Android groups notifications in "channels" the user can mute one by one in the settings. */
const CHANNEL_ID = 'reminders'

let channelReady = false

/** Creates our channel once. Creating it again is harmless, but there's no need. */
async function ensureChannel() {
  if (channelReady) return
  await LocalNotifications.createChannel({
    id: CHANNEL_ID,
    name: 'Recordatorios de cobro',
    description: 'Avisos antes de cada cobro',
    importance: 4, // "high": sound and a banner at the top
  })
  channelReady = true
}

/**
 * Makes the phone's scheduled notifications match the subscriptions: cancels what's
 * pending and schedules the fresh list. Does nothing in the browser, or until the user
 * has allowed notifications (the onboarding asks; `schedule()` would ask on its own).
 */
export async function syncNotifications(
  subscriptions: Subscription[],
  reminderTime: string,
) {
  if (!Capacitor.isNativePlatform()) return

  const { display } = await LocalNotifications.checkPermissions()
  if (display !== 'granted') return

  await ensureChannel()

  // Start clean: whatever was planned before may be outdated (edited, paused, deleted)
  const { notifications: pending } = await LocalNotifications.getPending()
  if (pending.length > 0) {
    await LocalNotifications.cancel({
      notifications: pending.map((notification) => ({ id: notification.id })),
    })
  }

  const planned = buildNotifications(subscriptions, new Date(), reminderTime)
  if (planned.length === 0) return

  await LocalNotifications.schedule({
    notifications: planned.map((notification) => ({
      id: notification.id,
      title: notification.title,
      body: notification.body,
      channelId: CHANNEL_ID,
      // Inexact: a few minutes late is fine, and it never opens the "Alarms" settings
      isExactNotification: false,
      // Rings even if the phone is idle (Doze); one per day is far under the limit
      schedule: { at: notification.at, allowWhileIdle: true },
    })),
  })
}

let timer: ReturnType<typeof setTimeout> | undefined
let queue = Promise.resolve()

/** Syncs with the latest data. Runs one at a time, so two syncs never mix their steps. */
function runSync() {
  const { subscriptions } = useSubscriptionStore.getState()
  const { reminderTime } = useSettingsStore.getState()
  queue = queue
    .then(() => syncNotifications(subscriptions, reminderTime))
    .catch((error) => console.error('Notifications sync failed', error))
}

/** Waits a moment, so a burst of changes (typing, several edits) syncs only once. */
function syncSoon() {
  clearTimeout(timer)
  timer = setTimeout(runSync, 1000)
}

/**
 * Keeps the phone's notifications up to date: once now, then whenever the subscriptions or
 * the reminder time change, and whenever the app comes back to the screen (the 60-day
 * window moves forward with the days). Call once, after the stores have loaded.
 */
export function startNotificationSync() {
  runSync()

  useSubscriptionStore.subscribe((state, previous) => {
    if (state.subscriptions !== previous.subscriptions) syncSoon()
  })
  useSettingsStore.subscribe((state, previous) => {
    if (state.reminderTime !== previous.reminderTime) syncSoon()
  })

  App.addListener('appStateChange', ({ isActive }) => {
    if (isActive) syncSoon()
  })
}
