// TYPES
import type { Subscription, SubscriptionStatus } from '@/shared/types'

// UTILS
import { isPausedOn, nextCharge } from './subscriptionHistory'

/** What `statusFor` reads. A `Subscription` fits. */
export type StatusSource = Pick<
  Subscription,
  'pauses' | 'trial' | 'firstBillDate' | 'billingCycle' | 'endDate'
>

/**
 * The status of a subscription today: `ended` when no charge is left before its end date,
 * `inactive` when the user paused it, otherwise `trial` while its trial has not ended yet
 * and `active` after. Calculated every time, never stored, so a trial that ends turns
 * `active` on its own, and a subscription past its end date turns `ended`.
 *
 * @param today `YYYY-MM-DD`; ISO dates compare correctly as text.
 */
export const statusFor = (sub: StatusSource, today: string): SubscriptionStatus => {
  if (nextCharge(sub, today) === null) return 'ended'
  if (isPausedOn(sub.pauses, today)) return 'inactive'
  return sub.trial && sub.trial.endDate > today ? 'trial' : 'active'
}

/**
 * Not being charged today: paused or ended. These go to the "Inactivas" filter, last in
 * every sort, and out of the monthly total.
 */
export const isInactive = (sub: StatusSource, today: string) => {
  const status = statusFor(sub, today)
  return status === 'inactive' || status === 'ended'
}
