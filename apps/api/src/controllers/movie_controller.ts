import { Request, Response, NextFunction } from 'express';
import movieService from '../services/movie.service';
import { MovieModel, MovieCategoryModel } from '../models';
import { MovieCategory } from '@nx-mono-repo-deployment-test/shared';
import { Op } from 'sequelize';

/**
 * Controller for Movie endpoints
 * Handles HTTP requests and responses
 * Uses response/error handler middleware for consistent responses
 */
class MovieController {
  /**
   * GET /api/movies
   * Get movies list (with filters)
   */
  getMovies = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    try {
      const { page = 1, language, content_type, limit = 20 } = req.query;

      const where: Record<string, unknown> = {};
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

      res.sendSuccess({
        data: movies.rows,
        count: movies.count,
        page: Number(page),
        limit: Number(limit),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get movies';
      res.sendError(errorMessage, 500);
    }
  };

  /**
   * GET /api/movies/:id
   * Get movie by ID
   */
  getMovieById = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
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
        res.sendError('Movie not found', 404);
        return;
      }

      res.sendSuccess(movie);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get movie';
      res.sendError(errorMessage, 500);
    }
  };

  /**
   * GET /api/movies/categories/list
   * Get available categories
   */
  getCategories = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
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

      res.sendSuccess(categories);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get categories';
      res.sendError(errorMessage, 500);
    }
  };

  /**
   * GET /api/movies/category/:category
   * Get movies by category
   */
  getMoviesByCategory = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
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

      res.sendSuccess({
        data: movies,
        count: movies.length,
        page: Number(page),
        limit: Number(limit),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get movies by category';
      res.sendError(errorMessage, 500);
    }
  };

  /**
   * GET /api/movies/search/:query
   * Search movies
   */
  searchMovies = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    try {
      const { query } = req.params;
      const { page = 1 } = req.query;

      // Search in database first
      const dbMovies = await MovieModel.findAll({
        where: {
          title: {
            [Op.iLike]: `%${query}%`,
          },
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
                [Op.iLike]: `%${query}%`,
              },
            },
            limit: 20,
            include: [
              {
                model: MovieCategoryModel,
                as: 'categories',
              },
            ],
          });
          res.sendSuccess({
            data: freshMovies,
            count: freshMovies.length,
          });
          return;
        } catch (tmdbError) {
          // If TMDB fails, return empty
        }
      }

      res.sendSuccess({
        data: dbMovies,
        count: dbMovies.length,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search movies';
      res.sendError(errorMessage, 500);
    }
  };

  /**
   * GET /api/movies/:id/streaming
   * Get streaming links for a movie
   */
  getStreamingLinks = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      // Find movie by ID
      const movie = await MovieModel.findByPk(id);

      if (!movie) {
        res.sendError('Movie not found', 404);
        return;
      }

      // Check if movie has TMDB ID
      if (!movie.tmdb_id) {
        res.sendError('Movie does not have TMDB ID', 400);
        return;
      }

      // Get streaming links
      const links = await movieService.getStreamingLinks(movie.tmdb_id);

      res.sendSuccess({
        movie_id: movie.id,
        tmdb_id: movie.tmdb_id,
        title: movie.title,
        streaming_links: links,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get streaming links';
      res.sendError(errorMessage, 500);
    }
  };
}

export default MovieController;

