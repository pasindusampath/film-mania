import { SubscriptionModel } from '../models';
import { ISubscription, SubscriptionStatus, PlanType } from '@nx-mono-repo-deployment-test/shared';

/**
 * Data Access Object for Subscription operations
 * Handles all database operations for subscriptions
 */
class SubscriptionDao {
  private static instance: SubscriptionDao;

  private constructor() {}

  public static getInstance(): SubscriptionDao {
    if (!SubscriptionDao.instance) {
      SubscriptionDao.instance = new SubscriptionDao();
    }
    return SubscriptionDao.instance;
  }

  /**
   * Find subscription by ID
   */
  public async findById(id: string): Promise<ISubscription | null> {
    try {
      const subscription = await SubscriptionModel.findByPk(id);
      return subscription ? this.mapToInterface(subscription) : null;
    } catch (error) {
      console.error(`Error in SubscriptionDao.findById (${id}):`, error);
      throw error;
    }
  }

  /**
   * Find latest subscription by user ID
   */
  public async findByUserId(userId: string): Promise<ISubscription | null> {
    try {
      const subscription = await SubscriptionModel.findOne({
        where: { user_id: userId },
        order: [['created_at', 'DESC']],
      });
      return subscription ? this.mapToInterface(subscription) : null;
    } catch (error) {
      console.error(`Error in SubscriptionDao.findByUserId (${userId}):`, error);
      throw error;
    }
  }

  /**
   * Find all subscriptions by user ID
   */
  public async findAllByUserId(userId: string): Promise<ISubscription[]> {
    try {
      const subscriptions = await SubscriptionModel.findAll({
        where: { user_id: userId },
        order: [['created_at', 'DESC']],
      });
      return subscriptions.map((sub) => this.mapToInterface(sub));
    } catch (error) {
      console.error(`Error in SubscriptionDao.findAllByUserId (${userId}):`, error);
      throw error;
    }
  }

  /**
   * Find subscription by Stripe subscription ID
   */
  public async findByStripeId(stripeSubscriptionId: string): Promise<ISubscription | null> {
    try {
      const subscription = await SubscriptionModel.findOne({
        where: { stripe_subscription_id: stripeSubscriptionId },
      });
      return subscription ? this.mapToInterface(subscription) : null;
    } catch (error) {
      console.error(`Error in SubscriptionDao.findByStripeId (${stripeSubscriptionId}):`, error);
      throw error;
    }
  }

  /**
   * Create a new subscription
   */
  public async create(data: {
    user_id: string;
    stripe_subscription_id?: string;
    status: SubscriptionStatus;
    plan_type: PlanType;
    start_date?: Date;
    end_date?: Date;
    current_period_start?: Date;
    current_period_end?: Date;
    funded_by_admin: boolean;
  }): Promise<ISubscription> {
    try {
      const subscription = await SubscriptionModel.create(data);
      return this.mapToInterface(subscription);
    } catch (error) {
      console.error('Error in SubscriptionDao.create:', error);
      throw error;
    }
  }

  /**
   * Update subscription
   */
  public async update(
    id: string,
    data: Partial<{
      stripe_subscription_id: string;
      status: SubscriptionStatus;
      plan_type: PlanType;
      start_date: Date;
      end_date: Date;
      current_period_start: Date;
      current_period_end: Date;
      funded_by_admin: boolean;
      cancelled_at: Date;
    }>
  ): Promise<ISubscription | null> {
    try {
      const subscription = await SubscriptionModel.findByPk(id);
      if (!subscription) {
        return null;
      }

      await subscription.update(data);
      return this.mapToInterface(subscription);
    } catch (error) {
      console.error(`Error in SubscriptionDao.update (${id}):`, error);
      throw error;
    }
  }

  /**
   * Update subscription by user ID
   */
  public async updateByUserId(
    userId: string,
    data: Partial<{
      status: SubscriptionStatus;
      end_date: Date;
      funded_by_admin: boolean;
    }>
  ): Promise<ISubscription | null> {
    try {
      const subscription = await SubscriptionModel.findOne({
        where: { user_id: userId },
        order: [['created_at', 'DESC']],
      });

      if (!subscription) {
        return null;
      }

      await subscription.update(data);
      return this.mapToInterface(subscription);
    } catch (error) {
      console.error(`Error in SubscriptionDao.updateByUserId (${userId}):`, error);
      throw error;
    }
  }

  /**
   * Find all subscriptions
   */
  public async findAll(): Promise<ISubscription[]> {
    try {
      const subscriptions = await SubscriptionModel.findAll({
        order: [['created_at', 'DESC']],
      });
      return subscriptions.map((sub) => this.mapToInterface(sub));
    } catch (error) {
      console.error('Error in SubscriptionDao.findAll:', error);
      throw error;
    }
  }

  /**
   * Delete subscription
   */
  public async delete(id: string): Promise<boolean> {
    try {
      const subscription = await SubscriptionModel.findByPk(id);
      if (!subscription) {
        return false;
      }

      await subscription.destroy();
      return true;
    } catch (error) {
      console.error(`Error in SubscriptionDao.delete (${id}):`, error);
      throw error;
    }
  }

  /**
   * Map Sequelize model to interface
   */
  private mapToInterface(model: SubscriptionModel): ISubscription {
    return {
      id: model.id,
      user_id: model.user_id,
      stripe_subscription_id: model.stripe_subscription_id,
      status: model.status as SubscriptionStatus,
      plan_type: model.plan_type as PlanType,
      start_date: model.start_date,
      end_date: model.end_date,
      current_period_start: model.current_period_start,
      current_period_end: model.current_period_end,
      funded_by_admin: model.funded_by_admin,
      cancelled_at: model.cancelled_at,
      created_at: model.created_at,
      updated_at: model.updated_at,
    };
  }
}

export default SubscriptionDao;

