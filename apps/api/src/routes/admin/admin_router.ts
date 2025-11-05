import { BaseRouter } from '../common/base_router';
import { AdminController } from '../../controllers';
import { authenticate, requireAdmin } from '../../middleware';
import { ValidationMiddleware } from '../../middleware/validation';
import { FundSubscriptionDto, AddApiCreditsDto } from '@nx-mono-repo-deployment-test/shared/src/dtos';

/**
 * Admin Router
 * Handles admin-only operations
 */
export class AdminRouter extends BaseRouter {
  private adminController!: AdminController;

  constructor() {
    super();
  }

  /**
   * Get or create the admin controller instance (lazy initialization)
   */
  private getAdminController(): AdminController {
    if (!this.adminController) {
      this.adminController = new AdminController();
    }
    return this.adminController;
  }

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
    const controller = this.getAdminController();

    // All routes require admin authentication
    this.router.use(authenticate);
    this.router.use(requireAdmin);

    // Fund user subscription
    this.router.post(
      '/fund-subscription',
      ValidationMiddleware.body(FundSubscriptionDto),
      controller.fundUserSubscription
    );

    // Get API credits
    this.router.get('/api-credits', controller.getApiCredits);

    // Add API credits
    this.router.post(
      '/api-credits',
      ValidationMiddleware.body(AddApiCreditsDto),
      controller.addApiCredits
    );

    // Get funding statistics
    this.router.get('/funding/stats', controller.getFundingStats);

    // List all funded users
    this.router.get('/funding/users', controller.getFundedUsers);
  }

  /**
   * Get the admin controller instance
   * Useful for testing or accessing controller methods directly
   */
  public getController(): AdminController {
    return this.getAdminController();
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

