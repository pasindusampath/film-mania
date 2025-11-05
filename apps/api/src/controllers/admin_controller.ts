import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware';
import AdminService from '../services/admin_service';

/**
 * Controller for Admin endpoints
 * Handles HTTP requests and responses
 * Uses response/error handler middleware for consistent responses
 */
class AdminController {
  private adminService: AdminService;

  constructor() {
    this.adminService = AdminService.getInstance();
  }
  /**
   * POST /api/admin/fund-subscription
   * Fund user subscription for specified months
   */
  fundUserSubscription = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      const { userId, months = 3, amount } = req.body;
      const adminId = authReq.user?.id;

      if (!adminId) {
        res.sendError('Admin authentication required', 401);
        return;
      }

      const result = await this.adminService.fundUserSubscription(userId, adminId, months, amount);

      if (result.success && result.data) {
        res.sendSuccess(result.data, result.message, 201);
      } else {
        res.sendError(result.error || 'Failed to fund subscription', 400);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fund subscription';
      res.sendError(errorMessage, 400);
    }
  };

  /**
   * GET /api/admin/api-credits
   * Get API credits
   */
  getApiCredits = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    try {
      const result = await this.adminService.getApiCredits();

      if (result.success && result.data) {
        res.sendSuccess(result.data);
      } else {
        res.sendError(result.error || 'Failed to get API credits', 500);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get API credits';
      res.sendError(errorMessage, 500);
    }
  };

  /**
   * POST /api/admin/api-credits
   * Add API credits
   */
  addApiCredits = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    try {
      const { apiProvider, credits, cost, expiryDate } = req.body;

      const result = await this.adminService.addApiCredits(apiProvider, credits, cost, expiryDate);

      if (result.success && result.data) {
        res.sendSuccess(result.data, result.message, 201);
      } else {
        res.sendError(result.error || 'Failed to add API credits', 400);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add API credits';
      res.sendError(errorMessage, 400);
    }
  };

  /**
   * GET /api/admin/funding/stats
   * Get funding statistics
   */
  getFundingStats = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    try {
      const result = await this.adminService.getFundingStats();

      if (result.success && result.data) {
        res.sendSuccess(result.data);
      } else {
        res.sendError(result.error || 'Failed to get funding stats', 500);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get funding stats';
      res.sendError(errorMessage, 500);
    }
  };

  /**
   * GET /api/admin/funding/users
   * Get funded users
   */
  getFundedUsers = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    try {
      const result = await this.adminService.getFundedUsers();

      if (result.success && result.data) {
        res.sendSuccess(result.data);
      } else {
        res.sendError(result.error || 'Failed to get funded users', 500);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get funded users';
      res.sendError(errorMessage, 500);
    }
  };
}

export default AdminController;

