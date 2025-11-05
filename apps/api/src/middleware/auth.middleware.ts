import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models';
import { appConfig } from '../config/app.config';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    is_admin: boolean;
  };
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.sendError('No token provided', 401);
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decoded = jwt.verify(token, appConfig.jwt.secret) as { id: string; email: string };

      // Fetch user from database
      const user = await UserModel.findByPk(decoded.id);

      if (!user || !user.is_active) {
        res.sendError('User not found or inactive', 401);
        return;
      }

      // Attach user to request
      req.user = {
        id: user.id,
        email: user.email,
        is_admin: user.is_admin,
      };

      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        res.sendError('Token expired', 401);
        return;
      }

      res.sendError('Invalid token', 401);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't fail if no token
 */
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, appConfig.jwt.secret) as { id: string; email: string };
      const user = await UserModel.findByPk(decoded.id);

      if (user && user.is_active) {
        req.user = {
          id: user.id,
          email: user.email,
          is_admin: user.is_admin,
        };
      }
    } catch (error) {
      // Silently fail for optional auth
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Admin only middleware
 * Must be used after authenticate middleware
 */
export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.sendError('Authentication required', 401);
    return;
  }

  if (!req.user.is_admin) {
    res.sendError('Admin access required', 403);
    return;
  }

  next();
};

