import { PaymentModel } from '../models';

/**
 * Data Access Object for Payment operations
 * Handles all database operations for payments
 */
class PaymentDao {
  private static instance: PaymentDao;

  private constructor() {}

  public static getInstance(): PaymentDao {
    if (!PaymentDao.instance) {
      PaymentDao.instance = new PaymentDao();
    }
    return PaymentDao.instance;
  }

  /**
   * Find payment by ID
   */
  public async findById(id: string): Promise<PaymentModel | null> {
    try {
      return await PaymentModel.findByPk(id);
    } catch (error) {
      console.error(`Error in PaymentDao.findById (${id}):`, error);
      throw error;
    }
  }

  /**
   * Find payment by Stripe payment intent ID
   */
  public async findByStripePaymentIntentId(stripePaymentIntentId: string): Promise<PaymentModel | null> {
    try {
      return await PaymentModel.findOne({
        where: { stripe_payment_intent_id: stripePaymentIntentId },
      });
    } catch (error) {
      console.error(`Error in PaymentDao.findByStripePaymentIntentId (${stripePaymentIntentId}):`, error);
      throw error;
    }
  }

  /**
   * Find all payments for a user
   */
  public async findByUserId(userId: string): Promise<PaymentModel[]> {
    try {
      return await PaymentModel.findAll({
        where: { user_id: userId },
        order: [['created_at', 'DESC']],
      });
    } catch (error) {
      console.error(`Error in PaymentDao.findByUserId (${userId}):`, error);
      throw error;
    }
  }

  /**
   * Create a new payment record
   */
  public async create(data: {
    user_id: string;
    amount: number;
    currency: string;
    status: string;
    stripe_payment_intent_id: string;
    subscription_id?: string;
    metadata?: Record<string, unknown>;
  }): Promise<PaymentModel> {
    try {
      return await PaymentModel.create(data);
    } catch (error) {
      console.error('Error in PaymentDao.create:', error);
      throw error;
    }
  }

  /**
   * Update payment status
   */
  public async updateStatus(id: string, status: string): Promise<PaymentModel | null> {
    try {
      const payment = await PaymentModel.findByPk(id);
      if (!payment) {
        return null;
      }

      await payment.update({ status });
      return payment;
    } catch (error) {
      console.error(`Error in PaymentDao.updateStatus (${id}):`, error);
      throw error;
    }
  }

  /**
   * Update payment by Stripe payment intent ID
   */
  public async updateByStripePaymentIntentId(
    stripePaymentIntentId: string,
    data: Partial<{
      status: string;
      amount: number;
      metadata: Record<string, unknown>;
    }>
  ): Promise<PaymentModel | null> {
    try {
      const payment = await this.findByStripePaymentIntentId(stripePaymentIntentId);
      if (!payment) {
        return null;
      }

      await payment.update(data);
      return payment;
    } catch (error) {
      console.error(`Error in PaymentDao.updateByStripePaymentIntentId (${stripePaymentIntentId}):`, error);
      throw error;
    }
  }

  /**
   * Find all payments
   */
  public async findAll(options?: {
    limit?: number;
    offset?: number;
  }): Promise<PaymentModel[]> {
    try {
      return await PaymentModel.findAll({
        limit: options?.limit,
        offset: options?.offset,
        order: [['created_at', 'DESC']],
      });
    } catch (error) {
      console.error('Error in PaymentDao.findAll:', error);
      throw error;
    }
  }

  /**
   * Delete payment
   */
  public async delete(id: string): Promise<boolean> {
    try {
      const payment = await PaymentModel.findByPk(id);
      if (!payment) {
        return false;
      }

      await payment.destroy();
      return true;
    } catch (error) {
      console.error(`Error in PaymentDao.delete (${id}):`, error);
      throw error;
    }
  }
}

export default PaymentDao;

