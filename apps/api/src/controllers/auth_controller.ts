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

      const result = await authService.register({
        email,
        password,
        first_name,
        last_name,
      });

      if (result.success && result.data) {
        // Generate tokens
        const tokens = authService.generateTokens(result.data.id!, result.data.email);

        res.sendSuccess(
          {
            user: {
              id: result.data.id,
              email: result.data.email,
              first_name: result.data.first_name,
              last_name: result.data.last_name,
              subscription_status: result.data.subscription_status,
            },
            ...tokens,
          },
          result.message || 'User registered successfully',
          201
        );
      } else {
        res.sendError(result.error || 'Registration failed', 400);
      }
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

      const result = await authService.login({ email, password });

      if (result.success && result.data) {
        res.sendSuccess(
          {
            user: {
              id: result.data.user.id,
              email: result.data.user.email,
              first_name: result.data.user.first_name,
              last_name: result.data.user.last_name,
              subscription_status: result.data.user.subscription_status,
            },
            ...result.data.tokens,
          },
          result.message || 'Login successful'
        );
      } else {
        res.sendError(result.error || 'Login failed', 401);
      }
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

      const userModel = await UserModel.findByPk(userId, {
        attributes: ['id', 'email', 'first_name', 'last_name', 'subscription_status', 'created_at'],
      });

      if (!userModel) {
        res.sendError('User not found', 404);
        return;
      }

      // Convert model to plain interface object
      const user = {
        id: userModel.id,
        email: userModel.email,
        first_name: userModel.first_name,
        last_name: userModel.last_name,
        subscription_status: userModel.subscription_status,
        created_at: userModel.created_at,
      };

      res.sendSuccess({ user }, 'User retrieved successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get user';
      res.sendError(errorMessage, 500);
    }
  };
}

export default AuthController;

