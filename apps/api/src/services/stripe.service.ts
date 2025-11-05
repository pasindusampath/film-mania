import Stripe from 'stripe';
import { SubscriptionModel, PaymentModel } from '../models';

/**
 * Stripe Service
 * Handles all Stripe-related operations
 */
class StripeService {
  private stripe: Stripe;

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2024-12-18.acacia',
    });
  }

  /**
   * Create a Stripe customer
   */
  async createCustomer(email: string, name?: string): Promise<Stripe.Customer> {
    return await this.stripe.customers.create({
      email,
      name,
    });
  }

  /**
   * Create a subscription
   */
  async createSubscription(
    customerId: string,
    priceId: string,
    metadata?: Record<string, string>
  ): Promise<Stripe.Subscription> {
    return await this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      metadata: metadata || {},
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    cancelImmediately: boolean = false
  ): Promise<Stripe.Subscription> {
    if (cancelImmediately) {
      return await this.stripe.subscriptions.cancel(subscriptionId);
    }
    return await this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }

  /**
   * Get subscription
   */
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return await this.stripe.subscriptions.retrieve(subscriptionId);
  }

  /**
   * Update subscription
   */
  async updateSubscription(
    subscriptionId: string,
    updates: Stripe.SubscriptionUpdateParams
  ): Promise<Stripe.Subscription> {
    return await this.stripe.subscriptions.update(subscriptionId, updates);
  }

  /**
   * Create payment intent
   */
  async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    metadata?: Record<string, string>
  ): Promise<Stripe.PaymentIntent> {
    return await this.stripe.paymentIntents.create({
      amount,
      currency,
      metadata: metadata || {},
    });
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(
    payload: string | Buffer,
    signature: string,
    secret: string
  ): Stripe.Event {
    return this.stripe.webhooks.constructEvent(payload, signature, secret);
  }

  /**
   * Get customer
   */
  async getCustomer(customerId: string): Promise<Stripe.Customer> {
    return await this.stripe.customers.retrieve(customerId) as Stripe.Customer;
  }

  /**
   * List customer's subscriptions
   */
  async listCustomerSubscriptions(customerId: string): Promise<Stripe.Subscription[]> {
    const subscriptions = await this.stripe.subscriptions.list({
      customer: customerId,
    });
    return subscriptions.data;
  }

  /**
   * Sync subscription from Stripe to database
   */
  async syncSubscriptionToDatabase(
    stripeSubscription: Stripe.Subscription,
    userId: string
  ): Promise<SubscriptionModel> {
    let subscription = await SubscriptionModel.findOne({
      where: { stripe_subscription_id: stripeSubscription.id },
    });

    const subscriptionData = {
      user_id: userId,
      stripe_subscription_id: stripeSubscription.id,
      status: this.mapStripeStatus(stripeSubscription.status),
      plan_type: this.getPlanType(stripeSubscription),
      start_date: new Date(stripeSubscription.created * 1000),
      end_date: stripeSubscription.cancel_at
        ? new Date(stripeSubscription.cancel_at * 1000)
        : stripeSubscription.current_period_end
        ? new Date(stripeSubscription.current_period_end * 1000)
        : null,
      current_period_start: stripeSubscription.current_period_start
        ? new Date(stripeSubscription.current_period_start * 1000)
        : null,
      current_period_end: stripeSubscription.current_period_end
        ? new Date(stripeSubscription.current_period_end * 1000)
        : null,
      cancelled_at: stripeSubscription.canceled_at
        ? new Date(stripeSubscription.canceled_at * 1000)
        : null,
    };

    if (subscription) {
      await subscription.update(subscriptionData);
    } else {
      subscription = await SubscriptionModel.create(subscriptionData);
    }

    return subscription;
  }

  /**
   * Map Stripe subscription status to our status
   */
  private mapStripeStatus(status: Stripe.Subscription.Status): string {
    const statusMap: Record<string, string> = {
      active: 'active',
      trialing: 'trialing',
      past_due: 'past_due',
      canceled: 'cancelled',
      unpaid: 'inactive',
      incomplete: 'inactive',
      incomplete_expired: 'inactive',
    };
    return statusMap[status] || 'inactive';
  }

  /**
   * Get plan type from subscription
   */
  private getPlanType(subscription: Stripe.Subscription): string {
    const interval = subscription.items.data[0]?.price?.recurring?.interval;
    return interval === 'year' ? 'yearly' : 'monthly';
  }

  /**
   * Create or update payment record
   */
  async syncPaymentToDatabase(
    paymentIntent: Stripe.PaymentIntent,
    userId: string,
    subscriptionId?: string
  ): Promise<PaymentModel> {
    let payment = await PaymentModel.findOne({
      where: { stripe_payment_intent_id: paymentIntent.id },
    });

    const paymentData = {
      user_id: userId,
      subscription_id: subscriptionId || null,
      stripe_payment_id: paymentIntent.id,
      stripe_payment_intent_id: paymentIntent.id,
      amount: paymentIntent.amount / 100, // Convert from cents
      currency: paymentIntent.currency,
      status: this.mapPaymentStatus(paymentIntent.status),
      payment_method: paymentIntent.payment_method_types[0] || null,
    };

    if (payment) {
      await payment.update(paymentData);
    } else {
      payment = await PaymentModel.create(paymentData);
    }

    return payment;
  }

  /**
   * Map Stripe payment status
   */
  private mapPaymentStatus(status: string): string {
    const statusMap: Record<string, string> = {
      succeeded: 'succeeded',
      pending: 'pending',
      failed: 'failed',
      canceled: 'failed',
      processing: 'pending',
    };
    return statusMap[status] || 'pending';
  }
}

export default new StripeService();

