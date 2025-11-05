import { MovieModel, MovieCategoryModel } from '../models';
import { MovieCategory } from '@nx-mono-repo-deployment-test/shared';

/**
 * Data Access Object for Movie operations
 * Handles all database operations for movies
 */
class MovieDao {
  private static instance: MovieDao;

  private constructor() {}

  public static getInstance(): MovieDao {
    if (!MovieDao.instance) {
      MovieDao.instance = new MovieDao();
    }
    return MovieDao.instance;
  }

  /**
   * Find movie by TMDB ID
   */
  public async findByTmdbId(tmdbId: number): Promise<MovieModel | null> {
    try {
      return await MovieModel.findOne({
        where: { tmdb_id: tmdbId },
      });
    } catch (error) {
      console.error(`Error in MovieDao.findByTmdbId (${tmdbId}):`, error);
      throw error;
    }
  }

  /**
   * Find movie by ID
   */
  public async findById(id: string): Promise<MovieModel | null> {
    try {
      return await MovieModel.findByPk(id);
    } catch (error) {
      console.error(`Error in MovieDao.findById (${id}):`, error);
      throw error;
    }
  }

  /**
   * Create a new movie
   */
  public async create(data: {
    tmdb_id: number;
    title: string;
    overview?: string;
    poster_path?: string;
    backdrop_path?: string;
    release_date?: string;
    language?: string;
    original_language?: string;
    runtime?: number;
    vote_average?: number;
    vote_count?: number;
    popularity?: number;
    content_type: string;
    streaming_links?: unknown[];
  }): Promise<MovieModel> {
    try {
      return await MovieModel.create(data);
    } catch (error) {
      console.error('Error in MovieDao.create:', error);
      throw error;
    }
  }

  /**
   * Update a movie
   */
  public async update(
    id: string,
    data: Partial<{
      title: string;
      overview: string;
      poster_path: string;
      backdrop_path: string;
      release_date: string;
      language: string;
      original_language: string;
      runtime: number;
      vote_average: number;
      vote_count: number;
      popularity: number;
      content_type: string;
      streaming_links: unknown[];
    }>
  ): Promise<MovieModel | null> {
    try {
      const movie = await MovieModel.findByPk(id);
      if (!movie) {
        return null;
      }

      await movie.update(data);
      return movie;
    } catch (error) {
      console.error(`Error in MovieDao.update (${id}):`, error);
      throw error;
    }
  }

  /**
   * Update movie by TMDB ID
   */
  public async updateByTmdbId(tmdbId: number, data: Record<string, unknown>): Promise<MovieModel | null> {
    try {
      const movie = await this.findByTmdbId(tmdbId);
      if (!movie) {
        return null;
      }

      await movie.update(data);
      return movie;
    } catch (error) {
      console.error(`Error in MovieDao.updateByTmdbId (${tmdbId}):`, error);
      throw error;
    }
  }

  /**
   * Find all movies with optional filters
   */
  public async findAll(options?: {
    limit?: number;
    offset?: number;
    order?: [string, string][];
  }): Promise<MovieModel[]> {
    try {
      return await MovieModel.findAll({
        limit: options?.limit,
        offset: options?.offset,
        order: options?.order || [['created_at', 'DESC']],
      });
    } catch (error) {
      console.error('Error in MovieDao.findAll:', error);
      throw error;
    }
  }

  /**
   * Delete movie categories for a movie
   */
  public async deleteCategories(movieId: string): Promise<void> {
    try {
      await MovieCategoryModel.destroy({
        where: { movie_id: movieId },
      });
    } catch (error) {
      console.error(`Error in MovieDao.deleteCategories (${movieId}):`, error);
      throw error;
    }
  }

  /**
   * Create movie category
   */
  public async createCategory(movieId: string, category: MovieCategory): Promise<void> {
    try {
      await MovieCategoryModel.create({
        movie_id: movieId,
        category,
      });
    } catch (error) {
      console.error(`Error in MovieDao.createCategory (${movieId}):`, error);
      throw error;
    }
  }

  /**
   * Get categories for a movie
   */
  public async getCategoriesByMovieId(movieId: string): Promise<MovieCategory[]> {
    try {
      const categories = await MovieCategoryModel.findAll({
        where: { movie_id: movieId },
      });
      return categories.map((cat) => cat.category as MovieCategory);
    } catch (error) {
      console.error(`Error in MovieDao.getCategoriesByMovieId (${movieId}):`, error);
      throw error;
    }
  }

  /**
   * Find movies by category
   */
  public async findByCategory(category: MovieCategory): Promise<MovieModel[]> {
    try {
      const categoryRecords = await MovieCategoryModel.findAll({
        where: { category },
        include: [MovieModel],
      });
      return categoryRecords.map((cat) => cat.movie).filter((movie): movie is MovieModel => movie !== null);
    } catch (error) {
      console.error(`Error in MovieDao.findByCategory (${category}):`, error);
      throw error;
    }
  }

  /**
   * Search movies by title
   */
  public async searchByTitle(query: string): Promise<MovieModel[]> {
    try {
      const { Op } = await import('sequelize');
      return await MovieModel.findAll({
        where: {
          title: {
            [Op.like]: `%${query}%`,
          },
        },
      });
    } catch (error) {
      console.error(`Error in MovieDao.searchByTitle (${query}):`, error);
      throw error;
    }
  }

  /**
   * Delete movie
   */
  public async delete(id: string): Promise<boolean> {
    try {
      const movie = await MovieModel.findByPk(id);
      if (!movie) {
        return false;
      }

      // Delete categories first
      await this.deleteCategories(id);
      await movie.destroy();
      return true;
    } catch (error) {
      console.error(`Error in MovieDao.delete (${id}):`, error);
      throw error;
    }
  }
}

export default MovieDao;

