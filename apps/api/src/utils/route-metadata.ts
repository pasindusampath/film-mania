import { RouteMetadata, AutoSwaggerGenerator } from './auto-swagger-generator';
import { RouteDocumentation } from './swagger-route-builder';

/**
 * Stores DTO references for route middleware so we can extract them later
 */
const routeMetadataStore = new Map<string, RouteMetadata & { middleware: unknown[] }>();

/**
 * Route registration helper that automatically extracts metadata and generates docs
 */
export class RouteMetadataHelper {
  /**
   * Registers a route with metadata for automatic Swagger generation
   */
  static registerRoute(
    path: string,
    method: RouteMetadata['method'],
    metadata: Omit<RouteMetadata, 'path' | 'method'>,
    middleware: unknown[]
  ): void {
    const key = `${method.toUpperCase()}:${path}`;
    routeMetadataStore.set(key, {
      path,
      method,
      ...metadata,
      middleware,
    });
  }

  /**
   * Generates Swagger documentation for all registered routes
   */
  static generateDocs(): RouteDocumentation[] {
    const docs: RouteDocumentation[] = [];

    routeMetadataStore.forEach((metadata) => {
      const doc = AutoSwaggerGenerator.generateFromMetadata(
        metadata,
        metadata.middleware
      );
      docs.push(doc);
    });

    return docs;
  }

  /**
   * Clears all registered route metadata
   */
  static clear(): void {
    routeMetadataStore.clear();
  }

  /**
   * Gets all registered routes
   */
  static getRoutes(): Array<RouteMetadata & { middleware: unknown[] }> {
    return Array.from(routeMetadataStore.values());
  }
}

