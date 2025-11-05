import { Request, Response } from 'express';
import { BaseRouter } from '../common/base_router';
import { authenticate, AuthRequest, requireAdmin } from '../../middleware';
import { validateRequest } from '../../middleware/simple-validation';
import stripeService from '../../services/stripe.service';
import { SubscriptionModel, UserModel } from '../../models';

/**
 * Subscription Router
 * Handles subscription management
 */
export class SubscriptionRouter extends BaseRouter {
  /**
   * Get base path for subscription routes
   */
  public getBasePath(): string {
    return '/subscriptions';
  }

  /**
   * Initialize routes
   */
  protected initializeRoutes(): void {
    // Get current user's subscription
    this.router.get('/current', authenticate, this.getCurrentSubscription.bind(this));

    // Create subscription
    this.router.post(
      '/create',
      authenticate,
      validateRequest({
        body: {
          priceId: { type: 'string', required: true },
          paymentMethodId: { type: 'string', required: false },
        },
      }),
      this.createSubscription.bind(this)
    );

    // Cancel subscription
    this.router.post(
      '/cancel',
      authenticate,
      validateRequest({
        body: {
          subscriptionId: { type: 'string', required: false },
          cancelImmediately: { type: 'boolean', required: false },
        },
      }),
      this.cancelSubscription.bind(this)
    );

    // Get subscription by ID (admin)
    this.router.get(
      '/:id',
      authenticate,
      requireAdmin,
      this.getSubscriptionById.bind(this)
    );

    // List all subscriptions (admin)
    this.router.get('/', authenticate, requireAdmin, this.listSubscriptions.bind(this));
  }

  /**
   * Get current user's subscription
   */
  private async getCurrentSubscription(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated',
        });
        return;
      }

      const subscription = await SubscriptionModel.findOne({
        where: { user_id: userId },
        order: [['created_at', 'DESC']],
        include: [{ model: UserModel, as: 'user', attributes: ['id', 'email'] }],
      });

      if (!subscription) {
        res.json({
          success: true,
          data: null,
        });
        return;
      }

      res.json({
        success: true,
        data: subscription,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get subscription';
      res.status(500).json({
        success: false,
        error: errorMessage,
      });
    }
  }

  /**
   * Create subscription
   */
  private async createSubscription(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.id;
      const { priceId } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated',
        });
        return;
      }

      // Get user
      const user = await UserModel.findByPk(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        });
        return;
      }

      // Create or get Stripe customer
      const customerId = user.email; // Simplified - in production, store customer ID
      // TODO: Store Stripe customer ID in user model

      // Create subscription
      const stripeSubscription = await stripeService.createSubscription(
        customerId,
        priceId,
        { userId: user.id }
      );

      // Sync to database
      const subscription = await stripeService.syncSubscriptionToDatabase(
        stripeSubscription,
        userId
      );

      res.status(201).json({
        success: true,
        data: subscription,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create subscription';
      res.status(400).json({
        success: false,
        error: errorMessage,
      });
    }
  }

  /**
   * Cancel subscription
   */
  private async cancelSubscription(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.id;
      const { subscriptionId, cancelImmediately } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated',
        });
        return;
      }

      // Find subscription
      const subscription = await SubscriptionModel.findOne({
        where: {
          user_id: userId,
          ...(subscriptionId ? { id: subscriptionId } : {}),
        },
        order: [['created_at', 'DESC']],
      });

      if (!subscription || !subscription.stripe_subscription_id) {
        res.status(404).json({
          success: false,
          error: 'Subscription not found',
        });
        return;
      }

      // Cancel in Stripe
      await stripeService.cancelSubscription(
        subscription.stripe_subscription_id,
        cancelImmediately || false
      );

      // Update in database
      await subscription.update({
        status: cancelImmediately ? 'cancelled' : subscription.status,
        cancelled_at: cancelImmediately ? new Date() : subscription.cancelled_at,
      });

      res.json({
        success: true,
        data: subscription,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel subscription';
      res.status(400).json({
        success: false,
        error: errorMessage,
      });
    }
  }

  /**
   * Get subscription by ID (admin)
   */
  private async getSubscriptionById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const subscription = await SubscriptionModel.findByPk(id, {
        include: [{ model: UserModel, as: 'user', attributes: ['id', 'email'] }],
      });

      if (!subscription) {
        res.status(404).json({
          success: false,
          error: 'Subscription not found',
        });
        return;
      }

      res.json({
        success: true,
        data: subscription,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get subscription';
      res.status(500).json({
        success: false,
        error: errorMessage,
      });
    }
  }

  /**
   * List all subscriptions (admin)
   */
  private async listSubscriptions(req: Request, res: Response): Promise<void> {
    try {
      const subscriptions = await SubscriptionModel.findAll({
        include: [{ model: UserModel, as: 'user', attributes: ['id', 'email'] }],
        order: [['created_at', 'DESC']],
      });

      res.json({
        success: true,
        data: subscriptions,
        count: subscriptions.length,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to list subscriptions';
      res.status(500).json({
        success: false,
        error: errorMessage,
      });
    }
  }

  /**
   * Get route information
   */
  public getRouteInfo(): Array<{ path: string; methods: string[] }> {
    return [
      { path: '/current', methods: ['GET'] },
      { path: '/create', methods: ['POST'] },
      { path: '/cancel', methods: ['POST'] },
      { path: '/:id', methods: ['GET'] },
      { path: '/', methods: ['GET'] },
    ];
  }
}

