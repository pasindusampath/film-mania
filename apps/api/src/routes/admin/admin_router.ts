import { Request, Response } from 'express';
import { BaseRouter } from '../common/base_router';
import { authenticate, requireAdmin, AuthRequest } from '../../middleware';
import { validateRequest } from '../../middleware/simple-validation';
import { AdminFundingModel, UserModel, SubscriptionModel, ApiCreditModel } from '../../models';

/**
 * Admin Router
 * Handles admin-only operations
 */
export class AdminRouter extends BaseRouter {
  /**
   * Get base path for admin routes
   */
  public getBasePath(): string {
    return '/admin';
  }

  /**
   * Initialize routes
   */
  protected initializeRoutes(): void {
    // All routes require admin authentication
    this.router.use(authenticate);
    this.router.use(requireAdmin);

    // Fund user subscription
    this.router.post(
      '/fund-subscription',
      validateRequest({
        body: {
          userId: { type: 'string', required: true },
          months: { type: 'number', required: false },
          amount: { type: 'number', required: false },
        },
      }),
      this.fundUserSubscription.bind(this)
    );

    // Get API credits
    this.router.get('/api-credits', this.getApiCredits.bind(this));

    // Add API credits
    this.router.post(
      '/api-credits',
      validateRequest({
        body: {
          apiProvider: { type: 'string', required: true },
          credits: { type: 'number', required: true },
          cost: { type: 'number', required: false },
          expiryDate: { type: 'string', required: false },
        },
      }),
      this.addApiCredits.bind(this)
    );

    // Get funding statistics
    this.router.get('/funding/stats', this.getFundingStats.bind(this));

    // List all funded users
    this.router.get('/funding/users', this.getFundedUsers.bind(this));
  }

  /**
   * Fund user subscription for 3 months
   */
  private async fundUserSubscription(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as AuthRequest;
      const { userId, months = 3, amount } = req.body;
      const adminId = authReq.user?.id;

      if (!adminId) {
        res.status(401).json({
          success: false,
          error: 'Admin authentication required',
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

      res.status(201).json({
        success: true,
        data: {
          funding,
          subscription,
        },
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fund subscription';
      res.status(400).json({
        success: false,
        error: errorMessage,
      });
    }
  }

  /**
   * Get API credits
   */
  private async getApiCredits(req: Request, res: Response): Promise<void> {
    try {
      const credits = await ApiCreditModel.findAll({
        order: [['purchase_date', 'DESC']],
      });

      res.json({
        success: true,
        data: credits,
        count: credits.length,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get API credits';
      res.status(500).json({
        success: false,
        error: errorMessage,
      });
    }
  }

  /**
   * Add API credits
   */
  private async addApiCredits(req: Request, res: Response): Promise<void> {
    try {
      const { apiProvider, credits, cost, expiryDate } = req.body;

      const credit = await ApiCreditModel.create({
        api_provider: apiProvider,
        credits_purchased: credits,
        credits_used: 0,
        cost: cost || null,
        purchase_date: new Date(),
        expiry_date: expiryDate ? new Date(expiryDate) : null,
      });

      res.status(201).json({
        success: true,
        data: credit,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add API credits';
      res.status(400).json({
        success: false,
        error: errorMessage,
      });
    }
  }

  /**
   * Get funding statistics
   */
  private async getFundingStats(req: Request, res: Response): Promise<void> {
    try {
      const totalFunding = await AdminFundingModel.findAll({
        where: { status: 'active' },
      });

      const totalAmount = totalFunding.reduce((sum, f) => sum + Number(f.amount), 0);
      const totalUsers = new Set(totalFunding.map((f) => f.user_id)).size;
      const totalMonths = totalFunding.reduce((sum, f) => sum + f.months_funded, 0);

      res.json({
        success: true,
        data: {
          totalFunding: totalFunding.length,
          totalAmount,
          totalUsers,
          totalMonths,
          activeFundings: totalFunding.length,
        },
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get funding stats';
      res.status(500).json({
        success: false,
        error: errorMessage,
      });
    }
  }

  /**
   * Get funded users
   */
  private async getFundedUsers(req: Request, res: Response): Promise<void> {
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

      res.json({
        success: true,
        data: fundings,
        count: fundings.length,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get funded users';
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
      { path: '/fund-subscription', methods: ['POST'] },
      { path: '/api-credits', methods: ['GET', 'POST'] },
      { path: '/funding/stats', methods: ['GET'] },
      { path: '/funding/users', methods: ['GET'] },
    ];
  }
}

