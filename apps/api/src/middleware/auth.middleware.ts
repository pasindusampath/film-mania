import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthDao } from '../dao';
import { UserRole } from '@nx-mono-repo-deployment-test/shared';
import { appConfig } from '../config/app.config';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
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

      // Fetch auth record from database
      const authDao = AuthDao.getInstance();
      const auth = await authDao.findByUserId(decoded.id);

      if (!auth || !auth.is_active) {
        res.sendError('User not found or inactive', 401);
        return;
      }

      // Attach user to request
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: auth.role,
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
      const authDao = AuthDao.getInstance();
      const auth = await authDao.findByUserId(decoded.id);

      if (auth && auth.is_active) {
        req.user = {
          id: decoded.id,
          email: decoded.email,
          role: auth.role,
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

  if (req.user.role !== UserRole.ADMIN) {
    res.sendError('Admin access required', 403);
    return;
  }

  next();
};

