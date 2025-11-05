import Stripe from 'stripe';
import { SubscriptionDao, PaymentDao } from '../dao';
import { 
  IApiResponse, 
  ISubscription, 
  IPayment,
  SubscriptionStatus, 
  PlanType, 
  PaymentStatus 
} from '@nx-mono-repo-deployment-test/shared';
import { appConfig } from '../config/app.config';
import { isProduction } from '../enums';

/**
 * Stripe Service
 * Handles all Stripe-related operations
 */
class StripeService {
  private stripe: Stripe | null = null;
  private initialized: boolean = false;
  private subscriptionDao: SubscriptionDao;
  private paymentDao: PaymentDao;

  constructor() {
    // Initialize DAOs
    this.subscriptionDao = SubscriptionDao.getInstance();
    this.paymentDao = PaymentDao.getInstance();
  }

  /**
   * Initialize Stripe client (lazy initialization)
   */
  private initializeStripe(): Stripe {
    if (this.initialized && this.stripe) {
      return this.stripe;
    }

    if (!appConfig.stripe.secretKey) {
      if (isProduction()) {
        throw new Error('STRIPE_SECRET_KEY environment variable is required in production');
      }
      // In development, return a mock/null stripe client
      // This allows the app to start without Stripe keys
      console.warn('⚠️  STRIPE_SECRET_KEY not set. Stripe features will be disabled in development.');
      this.initialized = true;
      return null as unknown as Stripe; // Type assertion to allow null
    }

    this.stripe = new Stripe(appConfig.stripe.secretKey, {
      apiVersion: appConfig.stripe.apiVersion as Stripe.LatestApiVersion,
    });
    this.initialized = true;
    return this.stripe;
  }

  /**
   * Get Stripe client instance
   */
  private getStripe(): Stripe {
    if (!this.stripe) {
      this.stripe = this.initializeStripe();
    }
    if (!this.stripe) {
      throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
    }
    return this.stripe;
  }

  /**
   * Check if Stripe is configured
   */
  private isConfigured(): boolean {
    return !!appConfig.stripe.secretKey;
  }

  /**
   * Create a Stripe customer
   */
  async createCustomer(email: string, name?: string): Promise<Stripe.Customer> {
    if (!this.isConfigured()) {
      throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
    }
    return await this.getStripe().customers.create({
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
    if (!this.isConfigured()) {
      throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
    }
    return await this.getStripe().subscriptions.create({
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
    if (!this.isConfigured()) {
      throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
    }
    if (cancelImmediately) {
      return await this.getStripe().subscriptions.cancel(subscriptionId);
    }
    return await this.getStripe().subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }

  /**
   * Get subscription
   */
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    if (!this.isConfigured()) {
      throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
    }
    return await this.getStripe().subscriptions.retrieve(subscriptionId);
  }

  /**
   * Update subscription
   */
  async updateSubscription(
    subscriptionId: string,
    updates: Stripe.SubscriptionUpdateParams
  ): Promise<Stripe.Subscription> {
    if (!this.isConfigured()) {
      throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
    }
    return await this.getStripe().subscriptions.update(subscriptionId, updates);
  }

  /**
   * Create payment intent
   */
  async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    metadata?: Record<string, string>
  ): Promise<Stripe.PaymentIntent> {
    if (!this.isConfigured()) {
      throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
    }
    return await this.getStripe().paymentIntents.create({
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
    if (!this.isConfigured()) {
      throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
    }
    return this.getStripe().webhooks.constructEvent(payload, signature, secret);
  }

  /**
   * Get customer
   */
  async getCustomer(customerId: string): Promise<Stripe.Customer> {
    if (!this.isConfigured()) {
      throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
    }
    return await this.getStripe().customers.retrieve(customerId) as Stripe.Customer;
  }

  /**
   * List customer's subscriptions
   */
  async listCustomerSubscriptions(customerId: string): Promise<Stripe.Subscription[]> {
    if (!this.isConfigured()) {
      throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
    }
    const subscriptions = await this.getStripe().subscriptions.list({
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
  ): Promise<IApiResponse<ISubscription>> {
    try {
      const existingSubscription = await this.subscriptionDao.findByStripeId(stripeSubscription.id);

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
          : undefined,
        current_period_start: stripeSubscription.current_period_start
          ? new Date(stripeSubscription.current_period_start * 1000)
          : undefined,
        current_period_end: stripeSubscription.current_period_end
          ? new Date(stripeSubscription.current_period_end * 1000)
          : undefined,
        funded_by_admin: false,
      };

      let subscription: ISubscription;
      if (existingSubscription) {
        subscription = (await this.subscriptionDao.update(existingSubscription.id!, {
          ...subscriptionData,
          cancelled_at: stripeSubscription.canceled_at
            ? new Date(stripeSubscription.canceled_at * 1000)
            : undefined,
        }))!;
      } else {
        subscription = await this.subscriptionDao.create(subscriptionData);
      }

      return {
        success: true,
        data: subscription,
        message: 'Subscription synced successfully',
      };
    } catch (error) {
      console.error('Error in StripeService.syncSubscriptionToDatabase:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to sync subscription',
      };
    }
  }

  /**
   * Map Stripe subscription status to our status enum
   */
  private mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
    const statusMap: Record<string, SubscriptionStatus> = {
      active: SubscriptionStatus.ACTIVE,
      trialing: SubscriptionStatus.TRIALING,
      past_due: SubscriptionStatus.PAST_DUE,
      canceled: SubscriptionStatus.CANCELLED,
      unpaid: SubscriptionStatus.INACTIVE,
      incomplete: SubscriptionStatus.INACTIVE,
      incomplete_expired: SubscriptionStatus.INACTIVE,
    };
    return statusMap[status] || SubscriptionStatus.INACTIVE;
  }

  /**
   * Get plan type from subscription
   */
  private getPlanType(subscription: Stripe.Subscription): PlanType {
    const interval = subscription.items.data[0]?.price?.recurring?.interval;
    return interval === 'year' ? PlanType.YEARLY : PlanType.MONTHLY;
  }

  /**
   * Create or update payment record
   */
  async syncPaymentToDatabase(
    paymentIntent: Stripe.PaymentIntent,
    userId: string,
    subscriptionId?: string
  ): Promise<IApiResponse<IPayment>> {
    try {
      const existingPayment = await this.paymentDao.findByStripePaymentIntentId(paymentIntent.id);

      const paymentData = {
        user_id: userId,
        amount: paymentIntent.amount / 100, // Convert from cents
        currency: paymentIntent.currency,
        status: this.mapPaymentStatus(paymentIntent.status),
        stripe_payment_intent_id: paymentIntent.id,
        subscription_id: subscriptionId,
        metadata: {
          payment_method: paymentIntent.payment_method_types[0] || null,
        },
      };

      let paymentModel;
      if (existingPayment) {
        paymentModel = (await this.paymentDao.updateByStripePaymentIntentId(paymentIntent.id, {
          status: paymentData.status,
          amount: paymentData.amount,
          metadata: paymentData.metadata,
        }))!;
      } else {
        paymentModel = await this.paymentDao.create(paymentData);
      }

      // Convert model to plain interface object
      const payment: IPayment = {
        id: paymentModel.id,
        user_id: paymentModel.user_id,
        amount: paymentModel.amount,
        currency: paymentModel.currency,
        status: paymentModel.status,
        stripe_payment_intent_id: paymentModel.stripe_payment_intent_id,
        subscription_id: paymentModel.subscription_id ?? undefined,
        metadata: paymentData.metadata,
        created_at: paymentModel.created_at,
        updated_at: paymentModel.updated_at,
      };

      return {
        success: true,
        data: payment,
        message: 'Payment synced successfully',
      };
    } catch (error) {
      console.error('Error in StripeService.syncPaymentToDatabase:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to sync payment',
      };
    }
  }

  /**
   * Map Stripe payment status to our status enum
   */
  private mapPaymentStatus(status: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      succeeded: PaymentStatus.SUCCEEDED,
      pending: PaymentStatus.PENDING,
      failed: PaymentStatus.FAILED,
      canceled: PaymentStatus.CANCELED,
      processing: PaymentStatus.PROCESSING,
    };
    return statusMap[status] || PaymentStatus.PENDING;
  }
}

export default new StripeService();

