/**
 * Admin funding status enum
 * Represents the current state of an admin-funded subscription
 */
export enum AdminFundingStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

/**
 * Type guard to check if a value is a valid admin funding status
 */
export function isAdminFundingStatus(value: unknown): value is AdminFundingStatus {
  return Object.values(AdminFundingStatus).includes(value as AdminFundingStatus);
}

