import { AdminFundingModel, UserModel, SubscriptionModel, ApiCreditModel } from '../models';
import { IApiResponse } from '@nx-mono-repo-deployment-test/shared/src/interfaces';

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
  ): Promise<IApiResponse<{ funding: AdminFundingModel; subscription: SubscriptionModel }>> {
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
      const funding = await AdminFundingModel.create({
        user_id: userId,
        amount: amount || 0,
        months_funded: months,
        start_date: startDate,
        end_date: endDate,
        status: 'active',
        created_by: adminId,
      });

      // Create or update subscription
      let subscription = await SubscriptionModel.findOne({
        where: { user_id: userId },
        order: [['created_at', 'DESC']],
      });

      if (subscription) {
        // Extend existing subscription
        await subscription.update({
          end_date: endDate,
          funded_by_admin: true,
          status: 'active',
        });
      } else {
        // Create new subscription
        subscription = await SubscriptionModel.create({
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
  public async getApiCredits(): Promise<IApiResponse<ApiCreditModel[]>> {
    try {
      const credits = await ApiCreditModel.findAll({
        order: [['purchase_date', 'DESC']],
      });

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
  ): Promise<IApiResponse<ApiCreditModel>> {
    try {
      const credit = await ApiCreditModel.create({
        api_provider: apiProvider,
        credits_purchased: credits,
        credits_used: 0,
        cost: cost || null,
        purchase_date: new Date(),
        expiry_date: expiryDate ? new Date(expiryDate) : null,
      });

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
  public async getFundedUsers(): Promise<IApiResponse<AdminFundingModel[]>> {
    try {
      const fundings = await AdminFundingModel.findAll({
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

