import { BaseRouter } from '../common/base_router';
import { AuthController } from '../../controllers';
import { authenticate } from '../../middleware';
import { ValidationMiddleware } from '../../middleware/validation';
import { RegisterDto, LoginDto, RefreshTokenDto } from '@nx-mono-repo-deployment-test/shared/src/dtos';

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
      ValidationMiddleware.body(RegisterDto),
      controller.register
    );

    // Login user
    this.router.post(
      '/login',
      ValidationMiddleware.body(LoginDto),
      controller.login
    );

    // Refresh token
    this.router.post(
      '/refresh',
      ValidationMiddleware.body(RefreshTokenDto),
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

