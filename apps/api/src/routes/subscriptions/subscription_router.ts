import { BaseRouter } from '../common/base_router';
import { SubscriptionController } from '../../controllers';
import { authenticate, requireAdmin } from '../../middleware';
import { validateRequest } from '../../middleware/simple-validation';

/**
 * Subscription Router
 * Handles subscription management
 */
export class SubscriptionRouter extends BaseRouter {
  private subscriptionController!: SubscriptionController;

  constructor() {
    super();
  }

  /**
   * Get or create the subscription controller instance (lazy initialization)
   */
  private getSubscriptionController(): SubscriptionController {
    if (!this.subscriptionController) {
      this.subscriptionController = new SubscriptionController();
    }
    return this.subscriptionController;
  }

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
    const controller = this.getSubscriptionController();

    // Get current user's subscription
    this.router.get('/current', authenticate, controller.getCurrentSubscription);

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
      controller.createSubscription
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
      controller.cancelSubscription
    );

    // Get subscription by ID (admin)
    this.router.get(
      '/:id',
      authenticate,
      requireAdmin,
      controller.getSubscriptionById
    );

    // List all subscriptions (admin)
    this.router.get('/', authenticate, requireAdmin, controller.listSubscriptions);
  }

  /**
   * Get the subscription controller instance
   * Useful for testing or accessing controller methods directly
   */
  public getController(): SubscriptionController {
    return this.getSubscriptionController();
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

