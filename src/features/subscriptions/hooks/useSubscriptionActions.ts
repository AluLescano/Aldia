import { useUIStore } from '@/shared/store/uiStore'
import { useToastStore } from '@/features/subscriptions/store/toastStore'
import { useSubscriptionStore } from '@/features/subscriptions/store/subscriptionStore'
import { todayISO } from '@/shared/lib/isoDate'
import type { Subscription } from '@/shared/types'

import { nextBillDate } from '../utils/billingCycle'
import { statusFor } from '../utils/subscriptionStatus'

// What the detail screen can do to an existing subscription besides editing its fields
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
      showToast('Suscripción reanudada', 'success')
    } else {
      updateSubscription(subscription.id, { status: 'inactive' })
      showToast('Suscripción pausada', 'info')
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
