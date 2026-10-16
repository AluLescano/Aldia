// STORES
import { useUIStore } from '@/shared/store/uiStore'
import { useToastStore } from '@/shared/store/toastStore'
import { useSubscriptionStore } from '../store/subscriptionStore'

// UTILS
import { todayISO } from '@/shared/lib/isoDate'
import { nextBillDate } from '../utils/billingCycle'
import { statusFor } from '../utils/subscriptionStatus'

// TYPES
import type { Subscription } from '@/shared/types'

/**
 * What the detail screen can do to a saved subscription besides editing its fields:
 * pause / resume (with a toast) and delete (closes the screen; Home offers the undo).
 * Every action does nothing while `subscription` is `undefined`.
 */
export const useSubscriptionActions = (subscription: Subscription | undefined) => {
  const updateSubscription = useSubscriptionStore((state) => state.updateSubscription)
  const deleteSubscription = useSubscriptionStore((state) => state.deleteSubscription)
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

  // The store remembers it as `lastDeleted`, so the Home screen offers the undo toast
  const remove = () => {
    if (!subscription) return
    deleteSubscription(subscription.id)
    popOverlay()
  }

  return { isPaused, togglePause, remove }
}
