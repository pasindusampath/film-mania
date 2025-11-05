import { AdminFundingModel, UserModel, SubscriptionModel, ApiCreditModel } from '../models';
import { IApiResponse, IAdminFunding, IApiCredit, ISubscription } from '@nx-mono-repo-deployment-test/shared/src/interfaces';

/**
 * Service layer for Admin business logic
 * Handles admin operations and business rules
 */
class AdminService {
  private static instance: AdminService;

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get AdminService singleton instance
   */
  public static getInstance(): AdminService {
    if (!AdminService.instance) {
      AdminService.instance = new AdminService();
    }
    return AdminService.instance;
  }

  /**
   * Fund user subscription for specified months
   */
  public async fundUserSubscription(
    userId: string,
    adminId: string,
    months: number = 3,
    amount?: number
  ): Promise<IApiResponse<{ funding: IAdminFunding; subscription: ISubscription }>> {
    try {
      // Get user
      const user = await UserModel.findByPk(userId);
      if (!user) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      // Calculate end date
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + months);

      // Create funding record
      const fundingModel = await AdminFundingModel.create({
        user_id: userId,
        amount: amount || 0,
        months_funded: months,
        start_date: startDate,
        end_date: endDate,
        status: 'active',
        created_by: adminId,
      });

      // Create or update subscription
      let subscriptionModel = await SubscriptionModel.findOne({
        where: { user_id: userId },
        order: [['created_at', 'DESC']],
      });

      if (subscriptionModel) {
        // Extend existing subscription
        await subscriptionModel.update({
          end_date: endDate,
          funded_by_admin: true,
          status: 'active',
        });
      } else {
        // Create new subscription
        subscriptionModel = await SubscriptionModel.create({
          user_id: userId,
          status: 'active',
          plan_type: 'monthly',
          start_date: startDate,
          end_date: endDate,
          funded_by_admin: true,
        });
      }

      // Update user subscription status
      await user.update({
        subscription_status: 'active',
      });

      // Convert models to plain interface objects
      const funding: IAdminFunding = {
        id: fundingModel.id,
        user_id: fundingModel.user_id,
        amount: Number(fundingModel.amount),
        months_funded: fundingModel.months_funded,
        start_date: fundingModel.start_date,
        end_date: fundingModel.end_date,
        status: fundingModel.status as 'active' | 'expired' | 'cancelled',
        created_by: fundingModel.created_by,
        created_at: fundingModel.created_at,
        updated_at: fundingModel.updated_at,
      };

      const subscription: ISubscription = {
        id: subscriptionModel.id,
        user_id: subscriptionModel.user_id,
        stripe_subscription_id: subscriptionModel.stripe_subscription_id,
        status: subscriptionModel.status as 'active' | 'inactive' | 'cancelled' | 'past_due' | 'trialing',
        plan_type: subscriptionModel.plan_type as 'monthly' | 'yearly',
        start_date: subscriptionModel.start_date,
        end_date: subscriptionModel.end_date,
        current_period_start: subscriptionModel.current_period_start,
        current_period_end: subscriptionModel.current_period_end,
        funded_by_admin: subscriptionModel.funded_by_admin,
        cancelled_at: subscriptionModel.cancelled_at,
        created_at: subscriptionModel.created_at,
        updated_at: subscriptionModel.updated_at,
      };

      return {
        success: true,
        data: {
          funding,
          subscription,
        },
        message: 'Subscription funded successfully',
      };
    } catch (error) {
      console.error('Error in AdminService.fundUserSubscription:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fund subscription',
      };
    }
  }

  /**
   * Get all API credits
   */
  public async getApiCredits(): Promise<IApiResponse<IApiCredit[]>> {
    try {
      const creditModels = await ApiCreditModel.findAll({
        order: [['purchase_date', 'DESC']],
      });

      // Convert models to plain interface objects
      const credits: IApiCredit[] = creditModels.map((model) => ({
        id: model.id,
        api_provider: model.api_provider,
        credits_purchased: model.credits_purchased,
        credits_used: model.credits_used,
        purchase_date: model.purchase_date,
        expiry_date: model.expiry_date,
        cost: model.cost ? Number(model.cost) : undefined,
        created_at: model.created_at,
        updated_at: model.updated_at,
      }));

      return {
        success: true,
        data: credits,
      };
    } catch (error) {
      console.error('Error in AdminService.getApiCredits:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get API credits',
      };
    }
  }

  /**
   * Add API credits
   */
  public async addApiCredits(
    apiProvider: string,
    credits: number,
    cost?: number,
    expiryDate?: string
  ): Promise<IApiResponse<IApiCredit>> {
    try {
      const creditModel = await ApiCreditModel.create({
        api_provider: apiProvider,
        credits_purchased: credits,
        credits_used: 0,
        cost: cost || null,
        purchase_date: new Date(),
        expiry_date: expiryDate ? new Date(expiryDate) : null,
      });

      // Convert model to plain interface object
      const credit: IApiCredit = {
        id: creditModel.id,
        api_provider: creditModel.api_provider,
        credits_purchased: creditModel.credits_purchased,
        credits_used: creditModel.credits_used,
        purchase_date: creditModel.purchase_date,
        expiry_date: creditModel.expiry_date,
        cost: creditModel.cost ? Number(creditModel.cost) : undefined,
        created_at: creditModel.created_at,
        updated_at: creditModel.updated_at,
      };

      return {
        success: true,
        data: credit,
        message: 'API credits added successfully',
      };
    } catch (error) {
      console.error('Error in AdminService.addApiCredits:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add API credits',
      };
    }
  }

  /**
   * Get funding statistics
   */
  public async getFundingStats(): Promise<IApiResponse<{
    totalFunding: number;
    totalAmount: number;
    totalUsers: number;
    totalMonths: number;
    activeFundings: number;
  }>> {
    try {
      const totalFunding = await AdminFundingModel.findAll({
        where: { status: 'active' },
      });

      const totalAmount = totalFunding.reduce((sum, f) => sum + Number(f.amount), 0);
      const totalUsers = new Set(totalFunding.map((f) => f.user_id)).size;
      const totalMonths = totalFunding.reduce((sum, f) => sum + f.months_funded, 0);

      return {
        success: true,
        data: {
          totalFunding: totalFunding.length,
          totalAmount,
          totalUsers,
          totalMonths,
          activeFundings: totalFunding.length,
        },
      };
    } catch (error) {
      console.error('Error in AdminService.getFundingStats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get funding stats',
      };
    }
  }

  /**
   * Get funded users
   */
  public async getFundedUsers(): Promise<IApiResponse<IAdminFunding[]>> {
    try {
      const fundingModels = await AdminFundingModel.findAll({
        where: { status: 'active' },
        include: [
          {
            model: UserModel,
            as: 'user',
            attributes: ['id', 'email', 'first_name', 'last_name'],
          },
        ],
        order: [['created_at', 'DESC']],
      });

      // Convert models to plain interface objects
      const fundings: IAdminFunding[] = fundingModels.map((model) => {
        const funding: IAdminFunding = {
          id: model.id,
          user_id: model.user_id,
          amount: Number(model.amount),
          months_funded: model.months_funded,
          start_date: model.start_date,
          end_date: model.end_date,
          status: model.status as 'active' | 'expired' | 'cancelled',
          created_by: model.created_by,
          created_at: model.created_at,
          updated_at: model.updated_at,
        };

        // Include user association if present
        if (model.user) {
          funding.user = {
            id: model.user.id,
            email: model.user.email,
            first_name: model.user.first_name,
            last_name: model.user.last_name,
          };
        }

        return funding;
      });

      return {
        success: true,
        data: fundings,
      };
    } catch (error) {
      console.error('Error in AdminService.getFundedUsers:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get funded users',
      };
    }
  }
}

export default AdminService;

