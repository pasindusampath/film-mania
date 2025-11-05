import { Request, Response } from 'express';
import { BaseRouter } from '../common/base_router';
import { authenticate, AuthRequest } from '../../middleware';
import authService from '../../services/auth.service';
import { validateRequest } from '../../middleware/simple-validation';

/**
 * Authentication Router
 * Handles user registration, login, and token refresh
 */
export class AuthRouter extends BaseRouter {
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
      this.register.bind(this)
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
      this.login.bind(this)
    );

    // Refresh token
    this.router.post(
      '/refresh',
      validateRequest({
        body: {
          refreshToken: { type: 'string', required: true },
        },
      }),
      this.refresh.bind(this)
    );

    // Get current user (protected)
    this.router.get('/me', authenticate, this.getCurrentUser.bind(this));
  }

  /**
   * Register a new user
   */
  private async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, first_name, last_name } = req.body;

      const user = await authService.register({
        email,
        password,
        first_name,
        last_name,
      });

      // Generate tokens
      const tokens = authService.generateTokens(user.id, user.email);

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            subscription_status: user.subscription_status,
          },
          ...tokens,
        },
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      res.status(400).json({
        success: false,
        error: errorMessage,
      });
    }
  }

  /**
   * Login user
   */
  private async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      const { user, tokens } = await authService.login({ email, password });

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            subscription_status: user.subscription_status,
            is_admin: user.is_admin,
          },
          ...tokens,
        },
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      res.status(401).json({
        success: false,
        error: errorMessage,
      });
    }
  }

  /**
   * Refresh access token
   */
  private async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      const tokens = await authService.refreshToken(refreshToken);

      res.json({
        success: true,
        data: tokens,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Token refresh failed';
      res.status(401).json({
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
      { path: '/register', methods: ['POST'] },
      { path: '/login', methods: ['POST'] },
      { path: '/refresh', methods: ['POST'] },
      { path: '/me', methods: ['GET'] },
    ];
  }

  /**
   * Get current authenticated user
   */
  private async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated',
        });
        return;
      }

      const { UserModel } = await import('../../models');
      const user = await UserModel.findByPk(userId, {
        attributes: ['id', 'email', 'first_name', 'last_name', 'subscription_status', 'is_admin', 'created_at'],
      });

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        });
        return;
      }

      res.json({
        success: true,
        data: { user },
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get user';
      res.status(500).json({
        success: false,
        error: errorMessage,
      });
    }
  }
}

