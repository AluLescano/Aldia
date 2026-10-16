// TYPES
import type { SubscriptionStatus, TrialConfig } from '@/shared/types'

/**
 * The status of a subscription that is not paused: `trial` while its trial has not
 * ended yet, `active` otherwise. (Pausing is the user's choice, so it's never decided here.)
 *
 * @param today `YYYY-MM-DD`; ISO dates compare correctly as text.
 */
export const statusFor = (
  trial: TrialConfig | undefined,
  today: string,
): SubscriptionStatus => (trial && trial.endDate > today ? 'trial' : 'active')
