import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware';
import authService from '../services/auth.service';
import { UserModel } from '../models';

/**
 * Controller for Auth endpoints
 * Handles HTTP requests and responses
 * Uses response/error handler middleware for consistent responses
 */
class AuthController {
  /**
   * POST /api/auth/register
   * Register a new user
   */
  register = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
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

      res.sendSuccess(
        {
          user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            subscription_status: user.subscription_status,
          },
          ...tokens,
        },
        'User registered successfully',
        201
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      res.sendError(errorMessage, 400);
    }
  };

  /**
   * POST /api/auth/login
   * Login user
   */
  login = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      const { user, tokens } = await authService.login({ email, password });

      res.sendSuccess(
        {
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
        'Login successful'
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      res.sendError(errorMessage, 401);
    }
  };

  /**
   * POST /api/auth/refresh
   * Refresh access token
   */
  refresh = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      const tokens = await authService.refreshToken(refreshToken);

      res.sendSuccess(tokens, 'Token refreshed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Token refresh failed';
      res.sendError(errorMessage, 401);
    }
  };

  /**
   * GET /api/auth/me
   * Get current authenticated user
   */
  getCurrentUser = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.id;

      if (!userId) {
        res.sendError('User not authenticated', 401);
        return;
      }

      const user = await UserModel.findByPk(userId, {
        attributes: ['id', 'email', 'first_name', 'last_name', 'subscription_status', 'is_admin', 'created_at'],
      });

      if (!user) {
        res.sendError('User not found', 404);
        return;
      }

      res.sendSuccess({ user }, 'User retrieved successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get user';
      res.sendError(errorMessage, 500);
    }
  };
}

export default AuthController;

