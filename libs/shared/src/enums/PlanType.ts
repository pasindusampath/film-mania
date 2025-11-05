/**
 * Subscription plan type enum
 * Represents the billing interval for a subscription
 */
export enum PlanType {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

/**
 * Type guard to check if a value is a valid plan type
 */
export function isPlanType(value: unknown): value is PlanType {
  return Object.values(PlanType).includes(value as PlanType);
}

