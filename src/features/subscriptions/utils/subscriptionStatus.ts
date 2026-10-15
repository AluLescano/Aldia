import type { SubscriptionStatus, TrialConfig } from '@/shared/types'

// The status of a subscription that is not paused: still in its trial, or paying
export const statusFor = (trial: TrialConfig | undefined, today: string): SubscriptionStatus =>
  trial && trial.endDate > today ? 'trial' : 'active' // ISO dates compare like text
