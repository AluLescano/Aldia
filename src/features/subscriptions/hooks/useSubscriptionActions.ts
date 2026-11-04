// STORES
import { useUIStore } from '@/shared/store/uiStore'
import { useToastStore } from '@/shared/store/toastStore'
import { useSubscriptionStore } from '../store/subscriptionStore'

// HOOKS
import { useDeleteSubscription } from './useDeleteSubscription'

// UTILS
import { todayISO } from '@/shared/lib/isoDate'
import { endPause, isPausedOn, startPause } from '../utils/subscriptionHistory'

// TYPES
import type { Subscription } from '@/shared/types'

/**
 * What the detail screen can do to a saved subscription besides editing its fields:
 * pause / resume (with a toast) and delete (closes the screen, toast with "Deshacer").
 * Every action does nothing while `subscription` is `undefined`.
 */
export const useSubscriptionActions = (subscription: Subscription | undefined) => {
  const updateSubscription = useSubscriptionStore((state) => state.updateSubscription)
  const deleteWithUndo = useDeleteSubscription()
  const popOverlay = useUIStore((state) => state.popOverlay)
  const showToast = useToastStore((state) => state.showToast)

  const today = todayISO()
  const isPaused = subscription ? isPausedOn(subscription.pauses, today) : false

  // Only the pauses are stored; trial or active is worked out from the dates when it's needed.
  // Resuming closes the pause, and drops it if it didn't skip a charge
  const togglePause = () => {
    if (!subscription) return

    const pauses = isPaused
      ? endPause(subscription.pauses, today, subscription)
      : startPause(subscription.pauses, today)
    updateSubscription(subscription.id, { pauses })
    if (isPaused) showToast('Subscripción reanudada', 'success')
    else showToast('Subscripción pausada', 'info')
  }

  // Closes the detail screen; the toast with "Deshacer" shows over Home
  const remove = () => {
    if (!subscription) return
    deleteWithUndo(subscription)
    popOverlay()
  }

  return { isPaused, togglePause, remove }
}
