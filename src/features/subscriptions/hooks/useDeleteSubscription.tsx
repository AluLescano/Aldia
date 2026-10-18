// STORES
import { useSubscriptionStore } from '../store/subscriptionStore'
import { useToastStore } from '@/shared/store/toastStore'

// TYPES
import type { Subscription } from '@/shared/types'

// ASSETS
import { IconUndo } from '@/assets/icons/IconUndo'

/**
 * Deletes a subscription and shows the app toast with "Deshacer". Each toast's undo
 * holds its own subscription, so deleting two in a row still lets the second come back.
 * Used by the swipe on Home and the delete button on the detail screen.
 *
 * @example
 * const deleteWithUndo = useDeleteSubscription()
 * <SubscriptionList onDelete={deleteWithUndo} />
 */
export const useDeleteSubscription = () => {
  const deleteSubscription = useSubscriptionStore((state) => state.deleteSubscription)
  const restoreSubscription = useSubscriptionStore((state) => state.restoreSubscription)
  const showToast = useToastStore((state) => state.showToast)

  return (subscription: Subscription) => {
    deleteSubscription(subscription.id)
    showToast(`Se eliminó ${subscription.name}`, 'success', {
      action: {
        label: 'Deshacer',
        icon: <IconUndo />,
        onClick: () => restoreSubscription(subscription),
      },
    })
  }
}
