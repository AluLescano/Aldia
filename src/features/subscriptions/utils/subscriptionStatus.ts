// TYPES
import type { Subscription, SubscriptionStatus } from '@/shared/types'

/**
 * The status of a subscription today: `inactive` when the user paused it, otherwise `trial`
 * while its trial has not ended yet and `active` after. Calculated every time, never stored,
 * so a trial that ends turns `active` on its own.
 *
 * @param today `YYYY-MM-DD`; ISO dates compare correctly as text.
 */
export const statusFor = (
  sub: Pick<Subscription, 'isPaused' | 'trial'>,
  today: string,
): SubscriptionStatus => {
  if (sub.isPaused) return 'inactive'
  return sub.trial && sub.trial.endDate > today ? 'trial' : 'active'
}
