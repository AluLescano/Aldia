// STORES
import { useSubscriptionStore } from '../store/subscriptionStore'
import { useToastStore } from '@/shared/store/toastStore'

// TYPES
import type { Subscription } from '@/shared/types'

// ASSETS
import { IconUndo } from '@/assets/icons/IconUndo'

/**
 * Deletes a subscription and shows the app toast with "Deshacer". The store keeps the
 * deleted one as `lastDeleted` until the toast goes away, so undo can put it back.
 * Used by the swipe on Home and the delete button on the detail screen.
 *
 * @example
 * const deleteWithUndo = useDeleteSubscription()
 * <SubscriptionList onDelete={deleteWithUndo} />
 */
export const useDeleteSubscription = () => {
  const deleteSubscription = useSubscriptionStore((state) => state.deleteSubscription)
  const undoDelete = useSubscriptionStore((state) => state.undoDelete)
  const clearLastDeleted = useSubscriptionStore((state) => state.clearLastDeleted)
  const showToast = useToastStore((state) => state.showToast)

  return (subscription: Subscription) => {
    deleteSubscription(subscription.id)
    showToast(`Se eliminó ${subscription.name}`, 'success', {
      action: { label: 'Deshacer', icon: <IconUndo />, onClick: undoDelete },
      onClose: clearLastDeleted,
    })
  }
}
