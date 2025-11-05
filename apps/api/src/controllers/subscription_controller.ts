import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware';
import stripeService from '../services/stripe.service';
import { SubscriptionModel, UserModel } from '../models';

/**
 * Controller for Subscription endpoints
 * Handles HTTP requests and responses
 * Uses response/error handler middleware for consistent responses
 */
class SubscriptionController {
  /**
   * GET /api/subscriptions/current
   * Get current user's subscription
   */
  getCurrentSubscription = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.id;

      if (!userId) {
        res.sendError('User not authenticated', 401);
        return;
      }

      const subscription = await SubscriptionModel.findOne({
        where: { user_id: userId },
        order: [['created_at', 'DESC']],
        include: [{ model: UserModel, as: 'user', attributes: ['id', 'email'] }],
      });

      if (!subscription) {
        res.sendSuccess(null, 'No subscription found');
        return;
      }

      res.sendSuccess(subscription);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get subscription';
      res.sendError(errorMessage, 500);
    }
  };

  /**
   * POST /api/subscriptions/create
   * Create subscription
   */
  createSubscription = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.id;
      const { priceId } = req.body;

      if (!userId) {
        res.sendError('User not authenticated', 401);
        return;
      }

      // Get user
      const user = await UserModel.findByPk(userId);
      if (!user) {
        res.sendError('User not found', 404);
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

      res.sendSuccess(subscription, 'Subscription created successfully', 201);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create subscription';
      res.sendError(errorMessage, 400);
    }
  };

  /**
   * POST /api/subscriptions/cancel
   * Cancel subscription
   */
  cancelSubscription = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.id;
      const { subscriptionId, cancelImmediately } = req.body;

      if (!userId) {
        res.sendError('User not authenticated', 401);
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
        res.sendError('Subscription not found', 404);
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

      res.sendSuccess(subscription, 'Subscription cancelled successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel subscription';
      res.sendError(errorMessage, 400);
    }
  };

  /**
   * GET /api/subscriptions/:id
   * Get subscription by ID (admin)
   */
  getSubscriptionById = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const subscription = await SubscriptionModel.findByPk(id, {
        include: [{ model: UserModel, as: 'user', attributes: ['id', 'email'] }],
      });

      if (!subscription) {
        res.sendError('Subscription not found', 404);
        return;
      }

      res.sendSuccess(subscription);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get subscription';
      res.sendError(errorMessage, 500);
    }
  };

  /**
   * GET /api/subscriptions
   * List all subscriptions (admin)
   */
  listSubscriptions = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    try {
      const subscriptions = await SubscriptionModel.findAll({
        include: [{ model: UserModel, as: 'user', attributes: ['id', 'email'] }],
        order: [['created_at', 'DESC']],
      });

      res.sendSuccess(subscriptions);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to list subscriptions';
      res.sendError(errorMessage, 500);
    }
  };
}

export default SubscriptionController;

