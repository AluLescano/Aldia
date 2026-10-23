// STORES
import { useUIStore } from '@/shared/store/uiStore'
import { useToastStore } from '@/shared/store/toastStore'
import { useSubscriptionStore } from '../store/subscriptionStore'

// HOOKS
import { useDeleteSubscription } from './useDeleteSubscription'

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

  const isPaused = subscription?.isPaused ?? false

  // Only the pause is stored; trial or active is worked out from the dates when it's needed
  const togglePause = () => {
    if (!subscription) return

    updateSubscription(subscription.id, { isPaused: !isPaused })
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
