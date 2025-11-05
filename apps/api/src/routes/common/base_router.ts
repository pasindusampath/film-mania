import { Router } from 'express';

/**
 * Abstract base class for all route classes
 * Provides common functionality and enforces route initialization pattern
 * 
 * Best Practices:
 * - Define path constants at the top of your router file for easy maintenance
 * - Include full path comments for clarity (RouterManager adds /api prefix automatically)
 * - Document all routes in the class JSDoc comment
 * - API routes get /api prefix automatically, health routes don't
 * 
 * Example:
 * ```typescript
 * // Route path constants
 * const USER_BASE_PATH = '/users'; // Full path: /api/users (api prefix added by RouterManager)
 * 
 * export class UserRouter extends BaseRouter {
 *   public getBasePath(): string {
 *     return USER_BASE_PATH; // RouterManager will add /api prefix
 *   }
 * }
 * ```
 */
export abstract class BaseRouter {
  protected router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  /**
   * Abstract method that must be implemented by all route classes
   * This method should define all routes for the specific resource
   */
  protected abstract initializeRoutes(): void;

  /**
   * Abstract method that must be implemented by all route classes
   * This method should return the base path for this router
   * @returns The base path for this router (e.g., '/api/items', '/health')
   */
  public abstract getBasePath(): string;

  /**
   * Get the configured router instance
   * @returns Express Router instance
   */
  public getRouter(): Router {
    return this.router;
  }

  /**
   * Get route information for this router
   * @returns Array of route information with full paths
   */
  public abstract getRouteInfo(): Array<{ path: string; methods: string[] }>;

  /**
   * Helper method to bind controller methods to preserve 'this' context
   * @param controllerMethod - The controller method to bind
   * @returns Bound method that preserves 'this' context
   */
  protected bindMethod<T extends (...args: unknown[]) => unknown>(controllerMethod: T): T {
    return controllerMethod.bind(controllerMethod) as T;
  }
}
