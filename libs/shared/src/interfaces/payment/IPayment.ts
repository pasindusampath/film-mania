/**
 * Payment interface
 * Represents a payment transaction in the system
 */
export interface IPayment {
  id?: string;
  user_id: string;
  amount: number;
  currency: string;
  status: string;
  stripe_payment_intent_id?: string;
  subscription_id?: string;
  metadata?: Record<string, unknown>;
  created_at?: Date;
  updated_at?: Date;
}

