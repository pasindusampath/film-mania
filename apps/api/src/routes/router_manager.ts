import { Router } from 'express';
import { ItemRouter } from './item/item_router';
import { HealthRouter } from './health/health_router';
import { AuthRouter } from './auth/auth_router';
import { SubscriptionRouter } from './subscriptions/subscription_router';
import { WebhookRouter } from './webhooks/webhook_router';
import { MovieRouter } from './movies/movie_router';
import { AdminRouter } from './admin/admin_router';

// Interface for router-like objects
interface RouterLike {
  getBasePath(): string;
  getRouter(): Router;
}

// Type guard to check if an object is RouterLike
function isRouterLike(router: Router | RouterLike): router is RouterLike {
  return 'getBasePath' in router && 'getRouter' in router && 
         typeof (router as RouterLike).getBasePath === 'function' &&
         typeof (router as RouterLike).getRouter === 'function';
}

// Route prefix constants
const API_PREFIX = '/api'; // Prefix for all API routes

/**
 * Central router manager that aggregates all route classes
 * Provides a single point to configure and access all application routes
 * 
 * Route Organization:
 * - Health routes: /health (no API prefix)
 * - API routes: /api/* (API prefix applied automatically)
 */
export class RouterManager {
  private static instance: RouterManager;
  private mainRouter: Router;
  private itemRouter: ItemRouter;
  private healthRouter: HealthRouter;
  private authRouter: AuthRouter;
  private subscriptionRouter: SubscriptionRouter;
  private webhookRouter: WebhookRouter;
  private movieRouter: MovieRouter;
  private adminRouter: AdminRouter;

  private constructor() {
    this.mainRouter = Router();
    this.itemRouter = new ItemRouter();
    this.healthRouter = new HealthRouter();
    this.authRouter = new AuthRouter();
    this.subscriptionRouter = new SubscriptionRouter();
    this.webhookRouter = new WebhookRouter();
    this.movieRouter = new MovieRouter();
    this.adminRouter = new AdminRouter();
    this.configureRoutes();
  }

  /**
   * Get RouterManager singleton instance
   */
  public static getInstance(): RouterManager {
    if (!RouterManager.instance) {
      RouterManager.instance = new RouterManager();
    }
    return RouterManager.instance;
  }

  /**
   * Initialize all router instances
   */
  private initializeRouters(): void {
    
  }

  /**
   * Configure main router with all sub-routes
   * Health routes are mounted at root level, API routes get /api prefix
   */
  private configureRoutes(): void {
    // Health routes (no API prefix) - mounted at root level
    this.mainRouter.use(this.healthRouter.getBasePath(), this.healthRouter.getRouter());
    
    // API routes (with /api prefix) - all API routes get the prefix automatically
    this.mainRouter.use(`${API_PREFIX}${this.itemRouter.getBasePath()}`, this.itemRouter.getRouter());
    this.mainRouter.use(`${API_PREFIX}${this.authRouter.getBasePath()}`, this.authRouter.getRouter());
    this.mainRouter.use(`${API_PREFIX}${this.subscriptionRouter.getBasePath()}`, this.subscriptionRouter.getRouter());
    this.mainRouter.use(`${API_PREFIX}${this.movieRouter.getBasePath()}`, this.movieRouter.getRouter());
    this.mainRouter.use(`${API_PREFIX}${this.adminRouter.getBasePath()}`, this.adminRouter.getRouter());
    // Webhooks don't use /api prefix and need raw body
    this.mainRouter.use(this.webhookRouter.getBasePath(), this.webhookRouter.getRouter());
  }

  /**
   * Get the main configured router
   * @returns Express Router with all routes configured
   */
  public getRouter(): Router {
    return this.mainRouter;
  }

  /**
   * Get specific router instances for testing or direct access
   */
  public getItemRouter(): ItemRouter {
    return this.itemRouter;
  }

  public getHealthRouter(): HealthRouter {
    return this.healthRouter;
  }

  public getAuthRouter(): AuthRouter {
    return this.authRouter;
  }

  /**
   * Add a new API router (gets /api prefix automatically)
   * @param router - The router instance that extends BaseRouter
   */
  public addApiRouter(router: RouterLike): void {
    if (!router.getBasePath || typeof router.getBasePath !== 'function') {
      throw new Error('API Router must extend BaseRouter with getBasePath() method');
    }
    // Add with /api prefix
    this.mainRouter.use(`${API_PREFIX}${router.getBasePath()}`, router.getRouter());
  }

  /**
   * Add a new router to the main router (for non-API routes like health)
   * Uses the router's own base path if it extends BaseRouter
   * @param router - The router instance to add (BaseRouter or Express Router)
   * @param customPath - Optional custom path override
   */
  public addRouter(router: Router | RouterLike, customPath?: string): void {
    if (customPath) {
      // Use custom path if provided
      this.mainRouter.use(customPath, isRouterLike(router) ? router.getRouter() : router);
    } else if (isRouterLike(router)) {
      // Use router's own base path if it's a RouterLike (no API prefix)
      this.mainRouter.use(router.getBasePath(), router.getRouter());
    } else {
      throw new Error('Router must either extend BaseRouter with getBasePath() or provide a custom path');
    }
  }

  /**
   * Get route information for debugging or documentation
   * Aggregates route information from all registered routers with correct full paths
   * @returns Array of route information with full paths
   */
  public getRouteInfo(): Array<{ path: string; methods: string[] }> {
    const routes: Array<{ path: string; methods: string[] }> = [];
    
    // Health routes (no API prefix)
    routes.push(...this.healthRouter.getRouteInfo().map(route => ({
      ...route,
      path: route.path // Health routes keep their original paths
    })));
    
    // API routes (with /api prefix)
    routes.push(...this.itemRouter.getRouteInfo().map(route => ({
      ...route,
      path: `${API_PREFIX}${route.path}` // Add API prefix to item routes
    })));
    
    routes.push(...this.authRouter.getRouteInfo().map(route => ({
      ...route,
      path: `${API_PREFIX}${route.path}` // Add API prefix to auth routes
    })));
    
    return routes;
  }
}
