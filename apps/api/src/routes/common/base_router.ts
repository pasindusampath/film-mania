import { Router } from 'express';
import { RouteDocumentation } from '../../utils/swagger-route-builder';
import { SwaggerDocRegistry } from '../../utils/swagger-doc-registry';

/**
 * Abstract base class for all route classes
 * Provides common functionality and enforces route initialization pattern
 * 
 * Best Practices:
 * - Define path constants at the top of your router file for easy maintenance
 * - Include full path comments for clarity (RouterManager adds /api prefix automatically)
 * - Document all routes in the class JSDoc comment
 * - API routes get /api prefix automatically, health routes don't
 * - Use registerSwaggerDocs() to register route documentation for Swagger
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
  private apiPrefix: string = '/api';

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

  /**
   * Register Swagger documentation for routes
   * This method should be called in initializeRoutes() after routes are defined
   * @param docs - Array of route documentation objects
   * @param useApiPrefix - Whether to prepend /api prefix (default: true for API routes)
   */
  protected registerSwaggerDocs(docs: RouteDocumentation[], useApiPrefix: boolean = true): void {
    // Adjust paths with API prefix if needed
    // Only add prefix if path doesn't already start with it
    const adjustedDocs = docs.map((doc) => ({
      ...doc,
      path: useApiPrefix && !doc.path.startsWith(this.apiPrefix) 
        ? `${this.apiPrefix}${doc.path}` 
        : doc.path,
    }));

    SwaggerDocRegistry.registerRoutes(adjustedDocs);
  }

  /**
   * Helper to build full path for Swagger documentation
   * @param path - Route path (relative to base path)
   * @param useApiPrefix - Whether to include /api prefix
   * @returns Full path for Swagger
   */
  protected buildSwaggerPath(path: string, useApiPrefix: boolean = true): string {
    const basePath = this.getBasePath();
    const fullPath = path.startsWith('/') ? path : `/${path}`;
    const combinedPath = `${basePath}${fullPath}`;
    return useApiPrefix ? `${this.apiPrefix}${combinedPath}` : combinedPath;
  }

  /**
   * Set API prefix (used by RouterManager)
   * @param prefix - API prefix string
   */
  public setApiPrefix(prefix: string): void {
    this.apiPrefix = prefix;
  }
}
