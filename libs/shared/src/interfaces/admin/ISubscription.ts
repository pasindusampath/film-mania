/**
 * Subscription interface
 */
export interface ISubscription {
  id?: string;
  user_id: string;
  stripe_subscription_id?: string;
  status: 'active' | 'inactive' | 'cancelled' | 'past_due' | 'trialing';
  plan_type: 'monthly' | 'yearly';
  start_date?: Date;
  end_date?: Date;
  current_period_start?: Date;
  current_period_end?: Date;
  funded_by_admin: boolean;
  cancelled_at?: Date;
  created_at?: Date;
  updated_at?: Date;
  // Optional associations
  user?: {
    id: string;
    email: string;
  };
}

