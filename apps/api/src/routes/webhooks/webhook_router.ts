import { Request, Response } from 'express';
import { BaseRouter } from '../common/base_router';
import stripeService from '../../services/stripe.service';
import { SubscriptionModel } from '../../models';
import { appConfig } from '../../config/app.config';
import Stripe from 'stripe';

/**
 * Webhook Router
 * Handles Stripe webhooks
 */
export class WebhookRouter extends BaseRouter {
  /**
   * Get base path for webhook routes
   */
  public getBasePath(): string {
    return '/webhooks';
  }

  /**
   * Initialize routes
   */
  protected initializeRoutes(): void {
    // Stripe webhook endpoint
    // Note: Stripe webhooks require raw body, so we handle it differently
    this.router.post(
      '/stripe',
      this.handleStripeWebhook.bind(this)
    );
  }

  /**
   * Handle Stripe webhook
   */
  private async handleStripeWebhook(req: Request, res: Response): Promise<void> {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = appConfig.stripe.webhookSecret;

    if (!sig || !webhookSecret) {
      res.sendError('Missing stripe signature or webhook secret', 400);
      return;
    }

    let event;
    try {
      // Get raw body for webhook verification
      const rawBody = JSON.stringify(req.body);
      event = stripeService.verifyWebhookSignature(
        rawBody,
        sig as string,
        webhookSecret
      );
    } catch (error: unknown) {
      console.error('Webhook signature verification failed:', error);
      res.sendError('Webhook signature verification failed', 400);
      return;
    }

    try {
      // Handle different event types
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;

        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error: unknown) {
      console.error('Error handling webhook:', error);
      const errorMessage = error instanceof Error ? error.message : 'Webhook handling failed';
      res.sendError(errorMessage, 500);
    }
  }

  /**
   * Handle subscription update
   */
  private async handleSubscriptionUpdate(stripeSubscription: Stripe.Subscription): Promise<void> {
    const userId = stripeSubscription.metadata?.userId;
    if (!userId) {
      console.error('No userId in subscription metadata');
      return;
    }

    await stripeService.syncSubscriptionToDatabase(stripeSubscription, userId);
  }

  /**
   * Handle subscription deleted
   */
  private async handleSubscriptionDeleted(stripeSubscription: Stripe.Subscription): Promise<void> {
    const subscription = await SubscriptionModel.findOne({
      where: { stripe_subscription_id: stripeSubscription.id },
    });

    if (subscription) {
      await subscription.update({
        status: 'cancelled',
        cancelled_at: new Date(),
      });
    }
  }

  /**
   * Handle payment succeeded
   */
  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const userId = paymentIntent.metadata?.userId;
    if (!userId) {
      console.error('No userId in payment intent metadata');
      return;
    }

    // Find associated subscription if any
    const subscription = await SubscriptionModel.findOne({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
    });

    await stripeService.syncPaymentToDatabase(
      paymentIntent,
      userId,
      subscription?.id
    );
  }

  /**
   * Handle payment failed
   */
  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const userId = paymentIntent.metadata?.userId;
    if (!userId) {
      return;
    }

    await stripeService.syncPaymentToDatabase(
      paymentIntent,
      userId
    );
  }

  /**
   * Get route information
   */
  public getRouteInfo(): Array<{ path: string; methods: string[] }> {
    return [
      { path: '/stripe', methods: ['POST'] },
    ];
  }
}

