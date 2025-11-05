/**
 * Subscription status enum
 * Represents the current state of a user subscription
 */
export enum SubscriptionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  CANCELLED = 'cancelled',
  PAST_DUE = 'past_due',
  TRIALING = 'trialing',
}

/**
 * Type guard to check if a value is a valid subscription status
 */
export function isSubscriptionStatus(value: unknown): value is SubscriptionStatus {
  return Object.values(SubscriptionStatus).includes(value as SubscriptionStatus);
}

