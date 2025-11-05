import { BaseRouter } from '../common/base_router';
import { AuthController } from '../../controllers';
import { authenticate } from '../../middleware';
import { validateRequest } from '../../middleware/simple-validation';

/**
 * Authentication Router
 * Handles user registration, login, and token refresh
 */
export class AuthRouter extends BaseRouter {
  private authController!: AuthController;

  constructor() {
    super();
  }

  /**
   * Get or create the auth controller instance (lazy initialization)
   */
  private getAuthController(): AuthController {
    if (!this.authController) {
      this.authController = new AuthController();
    }
    return this.authController;
  }

  /**
   * Get base path for auth routes
   */
  public getBasePath(): string {
    return '/auth';
  }

  /**
   * Initialize routes (required by BaseRouter)
   */
  protected initializeRoutes(): void {
    const controller = this.getAuthController();

    // Register new user
    this.router.post(
      '/register',
      validateRequest({
        body: {
          email: { type: 'string', required: true, isEmail: true },
          password: { type: 'string', required: true, minLength: 8 },
          first_name: { type: 'string', required: false },
          last_name: { type: 'string', required: false },
        },
      }),
      controller.register
    );

    // Login user
    this.router.post(
      '/login',
      validateRequest({
        body: {
          email: { type: 'string', required: true, isEmail: true },
          password: { type: 'string', required: true },
        },
      }),
      controller.login
    );

    // Refresh token
    this.router.post(
      '/refresh',
      validateRequest({
        body: {
          refreshToken: { type: 'string', required: true },
        },
      }),
      controller.refresh
    );

    // Get current user (protected)
    this.router.get('/me', authenticate, controller.getCurrentUser);
  }

  /**
   * Get route information
   */
  public getRouteInfo(): Array<{ path: string; methods: string[] }> {
    return [
      { path: '/register', methods: ['POST'] },
      { path: '/login', methods: ['POST'] },
      { path: '/refresh', methods: ['POST'] },
      { path: '/me', methods: ['GET'] },
    ];
  }

  /**
   * Get the auth controller instance
   * Useful for testing or accessing controller methods directly
   */
  public getController(): AuthController {
    return this.getAuthController();
  }
}

