import { Router, Request, Response } from 'express';
import { BaseRouter } from '../common/base_router';
import { authenticate, optionalAuth, AuthRequest } from '../../middleware';
import { validateRequest } from '../../middleware/simple-validation';
import movieService from '../../services/movie.service';
import { MovieModel, MovieCategoryModel } from '../../models';
import { MovieCategory } from '@nx-mono-repo-deployment-test/shared';

/**
 * Movie Router
 * Handles movie-related endpoints
 */
export class MovieRouter extends BaseRouter {
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
    // Get movies list (with filters)
    this.router.get('/', optionalAuth, this.getMovies.bind(this));

    // Get movie by ID
    this.router.get('/:id', optionalAuth, this.getMovieById.bind(this));

    // Get movie categories
    this.router.get('/categories/list', this.getCategories.bind(this));

    // Get movies by category
    this.router.get('/category/:category', optionalAuth, this.getMoviesByCategory.bind(this));

    // Search movies
    this.router.get('/search/:query', optionalAuth, this.searchMovies.bind(this));
  }

  /**
   * Get movies list
   */
  private async getMovies(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, language, content_type, limit = 20 } = req.query;

      const where: any = {};
      if (language) where.language = language;
      if (content_type) where.content_type = content_type;

      const movies = await MovieModel.findAndCountAll({
        where,
        limit: Number(limit),
        offset: (Number(page) - 1) * Number(limit),
        include: [
          {
            model: MovieCategoryModel,
            as: 'categories',
          },
        ],
        order: [['created_at', 'DESC']],
      });

      res.json({
        success: true,
        data: movies.rows,
        count: movies.count,
        page: Number(page),
        limit: Number(limit),
      });
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get movies',
      });
    }
  }

  /**
   * Get movie by ID
   */
  private async getMovieById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const movie = await MovieModel.findByPk(id, {
        include: [
          {
            model: MovieCategoryModel,
            as: 'categories',
          },
        ],
      });

      if (!movie) {
        res.status(404).json({
          success: false,
          error: 'Movie not found',
        });
        return;
      }

      res.json({
        success: true,
        data: movie,
      });
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get movie',
      });
    }
  }

  /**
   * Get available categories
   */
  private async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories: MovieCategory[] = [
        'Tamil',
        'Malayalam',
        'Hindi',
        'English',
        'Korean',
        'Japanese',
        'Anime',
      ];

      res.json({
        success: true,
        data: categories,
      });
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get categories',
      });
    }
  }

  /**
   * Get movies by category
   */
  private async getMoviesByCategory(req: Request, res: Response): Promise<void> {
    try {
      const { category } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const movies = await MovieModel.findAll({
        include: [
          {
            model: MovieCategoryModel,
            as: 'categories',
            where: { category },
          },
        ],
        limit: Number(limit),
        offset: (Number(page) - 1) * Number(limit),
        order: [['created_at', 'DESC']],
      });

      res.json({
        success: true,
        data: movies,
        count: movies.length,
        page: Number(page),
        limit: Number(limit),
      });
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get movies by category',
      });
    }
  }

  /**
   * Search movies
   */
  private async searchMovies(req: Request, res: Response): Promise<void> {
    try {
      const { query } = req.params;
      const { page = 1 } = req.query;

      // Search in database first
      const dbMovies = await MovieModel.findAll({
        where: {
          title: {
            [require('sequelize').Op.iLike]: `%${query}%`,
          } as any,
        },
        limit: 20,
        include: [
          {
            model: MovieCategoryModel,
            as: 'categories',
          },
        ],
      });

      // If not found, search TMDB
      if (dbMovies.length === 0) {
        try {
          const tmdbResults = await movieService.searchMovies(query, Number(page));
          // Save to database
          for (const result of tmdbResults.results.slice(0, 10)) {
            await movieService.saveMovieToDatabase(result, []);
          }
          // Return fresh results
          const freshMovies = await MovieModel.findAll({
            where: {
              title: {
                [require('sequelize').Op.iLike]: `%${query}%`,
              } as any,
            },
            limit: 20,
            include: [
              {
                model: MovieCategoryModel,
                as: 'categories',
              },
            ],
          });
          res.json({
            success: true,
            data: freshMovies,
            count: freshMovies.length,
          });
          return;
        } catch (tmdbError) {
          // If TMDB fails, return empty
        }
      }

      res.json({
        success: true,
        data: dbMovies,
        count: dbMovies.length,
      });
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search movies',
      });
    }
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
    ];
  }
}

