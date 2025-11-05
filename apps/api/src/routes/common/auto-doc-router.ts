import { BaseRouter } from './base_router';
import { RouteMetadataHelper } from '../../utils/route-metadata';
import { RouteDocumentation } from '../../utils/swagger-route-builder';
import { RouteMetadata } from '../../utils/auto-swagger-generator';
import { RequestHandler } from 'express';

/**
 * Enhanced BaseRouter with automatic Swagger documentation generation
 * Just provide route metadata and it automatically generates documentation
 */
export abstract class AutoDocRouter extends BaseRouter {
  /**
   * Register a route with automatic documentation
   * @param path - Route path
   * @param method - HTTP method
   * @param handlers - Route handlers (middleware + controller)
   * @param metadata - Route metadata for documentation
   */
  protected registerRoute(
    path: string,
    method: 'get' | 'post' | 'put' | 'delete' | 'patch',
    handlers: unknown[],
    metadata: Omit<RouteMetadata, 'path' | 'method'>
  ): void {
    // Register the route
    const fullPath = path.startsWith('/') ? path : `/${path}`;
    this.router[method](fullPath, ...(handlers as RequestHandler[]));

    // Extract middleware (everything except the last handler which is the controller)
    const middleware = handlers.slice(0, -1);

    // Register metadata for automatic documentation generation
    RouteMetadataHelper.registerRoute(
      this.buildSwaggerPath(fullPath, false), // Full path without API prefix
      method,
      metadata,
      middleware
    );
  }

  /**
   * Automatically generate Swagger documentation from registered routes
   * Call this in initializeRoutes() after all routes are registered
   */
  protected generateSwaggerDocs(): RouteDocumentation[] {
    return RouteMetadataHelper.generateDocs();
  }

  /**
   * Clear route metadata (useful for testing)
   */
  protected clearRouteMetadata(): void {
    RouteMetadataHelper.clear();
  }
}

