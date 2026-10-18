// STORES
import { useUIStore } from '@/shared/store/uiStore'
import { useToastStore } from '@/shared/store/toastStore'
import { useSubscriptionStore } from '../store/subscriptionStore'

// HOOKS
import { useDeleteSubscription } from './useDeleteSubscription'

// UTILS
import { todayISO } from '@/shared/lib/isoDate'
import { nextBillDate } from '../utils/billingCycle'
import { statusFor } from '../utils/subscriptionStatus'

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

  const isPaused = subscription?.status === 'inactive'

  const togglePause = () => {
    if (!subscription) return

    if (isPaused) {
      // The old next charge may be in the past by now, so it is calculated again from today
      updateSubscription(subscription.id, {
        status: statusFor(subscription.trial, todayISO()),
        nextBillDate: nextBillDate(
          subscription.firstBillDate,
          subscription.billingCycle,
          todayISO(),
        ),
      })
      showToast('Subscripción reanudada', 'success')
    } else {
      updateSubscription(subscription.id, { status: 'inactive' })
      showToast('Subscripción pausada', 'info')
    }
  }

  // Closes the detail screen; the toast with "Deshacer" shows over Home
  const remove = () => {
    if (!subscription) return
    deleteWithUndo(subscription)
    popOverlay()
  }

  return { isPaused, togglePause, remove }
}
