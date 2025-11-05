import { RouteDocumentation, SwaggerRouteBuilder } from './swagger-route-builder';

/**
 * Registry for Swagger route documentation
 * Collects all route documentation from routers and generates OpenAPI spec
 */
export class SwaggerDocRegistry {
  private static routes: RouteDocumentation[] = [];
  private static schemas: Record<string, unknown> = {};

  /**
   * Register a route documentation
   */
  static registerRoute(doc: RouteDocumentation): void {
    this.routes.push(doc);
    
    // Extract and register schemas
    const routeSchemas = SwaggerRouteBuilder.extractSchemas([doc]);
    Object.assign(this.schemas, routeSchemas);
  }

  /**
   * Register multiple routes
   */
  static registerRoutes(docs: RouteDocumentation[]): void {
    docs.forEach((doc) => this.registerRoute(doc));
    
    // Extract all schemas from all routes
    const allSchemas = SwaggerRouteBuilder.extractSchemas(this.routes);
    Object.assign(this.schemas, allSchemas);
  }

  /**
   * Get all registered routes as OpenAPI paths
   */
  static getPaths(): Record<string, unknown> {
    const paths: Record<string, unknown> = {};

    this.routes.forEach((route) => {
      const pathKey = route.path;
      const pathObj = SwaggerRouteBuilder.buildPath(route);
      
      if (!paths[pathKey]) {
        paths[pathKey] = {};
      }
      
      Object.assign(paths[pathKey] as Record<string, unknown>, pathObj);
    });

    return paths;
  }

  /**
   * Get all registered schemas
   */
  static getSchemas(): Record<string, unknown> {
    return { ...this.schemas };
  }

  /**
   * Clear all registered routes and schemas
   */
  static clear(): void {
    this.routes = [];
    this.schemas = {};
  }

  /**
   * Get all registered routes
   */
  static getRoutes(): RouteDocumentation[] {
    return [...this.routes];
  }
}

