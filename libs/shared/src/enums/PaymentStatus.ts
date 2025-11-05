/**
 * Payment status enum
 * Represents the current state of a payment transaction
 */
export enum PaymentStatus {
  SUCCEEDED = 'succeeded',
  PENDING = 'pending',
  FAILED = 'failed',
  PROCESSING = 'processing',
  CANCELED = 'canceled',
}

/**
 * Type guard to check if a value is a valid payment status
 */
export function isPaymentStatus(value: unknown): value is PaymentStatus {
  return Object.values(PaymentStatus).includes(value as PaymentStatus);
}

