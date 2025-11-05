import { AdminDao, UserDao, SubscriptionDao, ApiCreditDao } from '../dao';
import { IApiResponse, IAdminFunding, IApiCredit, ISubscription, AdminFundingStatus, SubscriptionStatus, PlanType } from '@nx-mono-repo-deployment-test/shared';

/**
 * Service layer for Admin business logic
 * Handles admin operations and business rules
 */
class AdminService {
  private static instance: AdminService;
  private adminDao: AdminDao;
  private userDao: UserDao;
  private subscriptionDao: SubscriptionDao;
  private apiCreditDao: ApiCreditDao;

  private constructor() {
    // Initialize DAOs
    this.adminDao = AdminDao.getInstance();
    this.userDao = UserDao.getInstance();
    this.subscriptionDao = SubscriptionDao.getInstance();
    this.apiCreditDao = ApiCreditDao.getInstance();
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
      const user = await this.userDao.findById(userId);
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
      const funding = await this.adminDao.createFunding({
        user_id: userId,
        amount: amount || 0,
        months_funded: months,
        start_date: startDate,
        end_date: endDate,
        status: AdminFundingStatus.ACTIVE,
        created_by: adminId,
      });

      // Create or update subscription
      const existingSubscription = await this.subscriptionDao.findByUserId(userId);
      
      let subscription: ISubscription;
      if (existingSubscription) {
        // Extend existing subscription
        const updated = await this.subscriptionDao.updateByUserId(userId, {
          end_date: endDate,
          funded_by_admin: true,
          status: SubscriptionStatus.ACTIVE,
        });
        subscription = updated!;
      } else {
        // Create new subscription
        subscription = await this.subscriptionDao.create({
          user_id: userId,
          status: SubscriptionStatus.ACTIVE,
          plan_type: PlanType.MONTHLY,
          start_date: startDate,
          end_date: endDate,
          funded_by_admin: true,
        });
      }

      // Update user subscription status
      await this.userDao.updateSubscriptionStatus(userId, 'active');

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
      const credits = await this.apiCreditDao.findAll();

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
      const credit = await this.apiCreditDao.create({
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
      const activeFundings = await this.adminDao.findActiveFundings();

      const totalAmount = activeFundings.reduce((sum, f) => sum + f.amount, 0);
      const totalUsers = new Set(activeFundings.map((f) => f.user_id)).size;
      const totalMonths = activeFundings.reduce((sum, f) => sum + f.months_funded, 0);

      return {
        success: true,
        data: {
          totalFunding: activeFundings.length,
          totalAmount,
          totalUsers,
          totalMonths,
          activeFundings: activeFundings.length,
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
      const fundings = await this.adminDao.findFundedUsersWithDetails();

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

