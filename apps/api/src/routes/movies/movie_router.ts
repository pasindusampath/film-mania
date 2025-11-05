import { BaseRouter } from '../common/base_router';
import { MovieController } from '../../controllers';
import { optionalAuth } from '../../middleware';

/**
 * Movie Router
 * Handles movie-related endpoints
 */
export class MovieRouter extends BaseRouter {
  private movieController!: MovieController;

  constructor() {
    super();
  }

  /**
   * Get or create the movie controller instance (lazy initialization)
   */
  private getMovieController(): MovieController {
    if (!this.movieController) {
      this.movieController = new MovieController();
    }
    return this.movieController;
  }

  /**
   * Get base path for movie routes
   */
  public getBasePath(): string {
    return '/movies';
  }

  /**
   * Initialize routes
   */
  protected initializeRoutes(): void {
    const controller = this.getMovieController();

    // Get movies list (with filters)
    this.router.get('/', optionalAuth, controller.getMovies);

    // Get movie by ID
    this.router.get('/:id', optionalAuth, controller.getMovieById);

    // Get movie categories
    this.router.get('/categories/list', controller.getCategories);

    // Get movies by category
    this.router.get('/category/:category', optionalAuth, controller.getMoviesByCategory);

    // Search movies
    this.router.get('/search/:query', optionalAuth, controller.searchMovies);

    // Get streaming links for a movie
    this.router.get('/:id/streaming', optionalAuth, controller.getStreamingLinks);
  }

  /**
   * Get the movie controller instance
   * Useful for testing or accessing controller methods directly
   */
  public getController(): MovieController {
    return this.getMovieController();
  }

  /**
   * Get route information
   */
  public getRouteInfo(): Array<{ path: string; methods: string[] }> {
    return [
      { path: '/', methods: ['GET'] },
      { path: '/:id', methods: ['GET'] },
      { path: '/categories/list', methods: ['GET'] },
      { path: '/category/:category', methods: ['GET'] },
      { path: '/search/:query', methods: ['GET'] },
      { path: '/:id/streaming', methods: ['GET'] },
    ];
  }
}

