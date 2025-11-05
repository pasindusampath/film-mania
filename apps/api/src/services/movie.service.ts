import axios, { AxiosInstance } from 'axios';
import { MovieModel } from '../models';
import { MovieDao, ApiCreditDao, ApiUsageDao } from '../dao';
import {
  ITMDBMovie,
  ITMDBMovieListResponse,
  ITMDBMovieDetails,
  ITMDBPaginatedResponse,
  IStreamingLink,
  MovieCategory,
} from '@nx-mono-repo-deployment-test/shared';
import { appConfig } from '../config/app.config';
import streamingService from './streaming.service';

/**
 * Movie Service
 * Handles movie data from TMDB and streaming APIs
 */
class MovieService {
  private tmdbClient: AxiosInstance;
  private movieDao: MovieDao;
  private apiCreditDao: ApiCreditDao;
  private apiUsageDao: ApiUsageDao;

  constructor() {
    this.tmdbClient = axios.create({
      baseURL: appConfig.tmdb.baseUrl,
      params: {
        api_key: appConfig.tmdb.apiKey,
      },
    });
    
    // Initialize DAOs
    this.movieDao = MovieDao.getInstance();
    this.apiCreditDao = ApiCreditDao.getInstance();
    this.apiUsageDao = ApiUsageDao.getInstance();
  }

  /**
   * Search movies
   */
  async searchMovies(query: string, page: number = 1): Promise<ITMDBMovieListResponse> {
    try {
      await this.checkApiCredits('tmdb');
      const response = await this.tmdbClient.get<ITMDBMovieListResponse>('/search/movie', {
        params: { query, page },
      });
      await this.trackApiUsage('tmdb', 'search/movie', query);
      return response.data;
    } catch (error: unknown) {
      console.error('TMDB search error:', error);
      throw new Error('Failed to search movies');
    }
  }

  /**
   * Get popular movies
   */
  async getPopularMovies(page: number = 1, language?: string): Promise<ITMDBMovieListResponse> {
    try {
      await this.checkApiCredits('tmdb');
      const response = await this.tmdbClient.get<ITMDBMovieListResponse>('/movie/popular', {
        params: { page, language },
      });
      await this.trackApiUsage('tmdb', 'movie/popular');
      return response.data;
    } catch (error: unknown) {
      console.error('TMDB popular movies error:', error);
      throw new Error('Failed to get popular movies');
    }
  }

  /**
   * Get trending movies
   */
  async getTrendingMovies(timeWindow: 'day' | 'week' = 'day'): Promise<ITMDBPaginatedResponse<ITMDBMovie>> {
    try {
      await this.checkApiCredits('tmdb');
      const response = await this.tmdbClient.get<ITMDBPaginatedResponse<ITMDBMovie>>(`/trending/movie/${timeWindow}`);
      await this.trackApiUsage('tmdb', `trending/movie/${timeWindow}`);
      return response.data;
    } catch (error: unknown) {
      console.error('TMDB trending movies error:', error);
      throw new Error('Failed to get trending movies');
    }
  }

  /**
   * Get movie details by TMDB ID
   */
  async getMovieDetails(tmdbId: number): Promise<ITMDBMovieDetails> {
    try {
      await this.checkApiCredits('tmdb');
      const response = await this.tmdbClient.get<ITMDBMovieDetails>(`/movie/${tmdbId}`);
      await this.trackApiUsage('tmdb', `movie/${tmdbId}`);
      return response.data;
    } catch (error: unknown) {
      console.error('TMDB movie details error:', error);
      throw new Error('Failed to get movie details');
    }
  }

  /**
   * Get movies by language/region
   */
  async getMoviesByLanguage(
    language: string,
    page: number = 1
  ): Promise<ITMDBMovieListResponse> {
    try {
      await this.checkApiCredits('tmdb');
      const response = await this.tmdbClient.get<ITMDBMovieListResponse>('/discover/movie', {
        params: {
          with_original_language: language,
          page,
        },
      });
      await this.trackApiUsage('tmdb', 'discover/movie', language);
      return response.data;
    } catch (error: unknown) {
      console.error('TMDB movies by language error:', error);
      throw new Error('Failed to get movies by language');
    }
  }

  /**
   * Get streaming links for a movie
   * Uses the configured streaming provider (TMDB, VidAPI, StreamAPI, or Watchmode)
   */
  async getStreamingLinks(tmdbId: number): Promise<IStreamingLink[]> {
    try {
      if (!tmdbId) {
        return [];
      }

      // Use streaming service to get links
      const links = await streamingService.getStreamingLinks(tmdbId);
      
      return links;
    } catch (error: unknown) {
      console.error('Streaming links error:', error);
      return [];
    }
  }

  /**
   * Save movie to database
   */
  async saveMovieToDatabase(tmdbData: ITMDBMovie | ITMDBMovieDetails, categories: MovieCategory[]): Promise<MovieModel> {
    let movie = await this.movieDao.findByTmdbId(tmdbData.id);

    const movieData = {
      tmdb_id: tmdbData.id,
      title: tmdbData.title,
      overview: tmdbData.overview || undefined,
      poster_path: tmdbData.poster_path || undefined,
      backdrop_path: tmdbData.backdrop_path || undefined,
      release_date: tmdbData.release_date,
      language: tmdbData.original_language,
      original_language: tmdbData.original_language,
      runtime: tmdbData.runtime,
      vote_average: tmdbData.vote_average,
      vote_count: tmdbData.vote_count,
      popularity: tmdbData.popularity,
      content_type: 'movie', // Default to movie
      streaming_links: [],
    };

    if (movie) {
      await this.movieDao.updateByTmdbId(tmdbData.id, movieData);
    } else {
      movie = await this.movieDao.create(movieData);
    }

    // Save categories
    if (categories.length > 0) {
      await this.movieDao.deleteCategories(movie!.id);

      for (const category of categories) {
        await this.movieDao.createCategory(movie!.id, category);
      }
    }

    return movie!;
  }

  /**
   * Check API credits before making request
   */
  private async checkApiCredits(provider: string): Promise<void> {
    const credit = await this.apiCreditDao.findByProvider(provider);

    if (!credit) {
      throw new Error(`No API credits available for ${provider}`);
    }

    if (credit.credits_used >= credit.credits_purchased) {
      throw new Error(`API credits exhausted for ${provider}`);
    }

    if (credit.expiry_date && new Date(credit.expiry_date) < new Date()) {
      throw new Error(`API credits expired for ${provider}`);
    }
  }

  /**
   * Track API usage
   */
  private async trackApiUsage(
    provider: string,
    endpoint: string,
    requestType?: string
  ): Promise<void> {
    try {
      await this.apiUsageDao.create({
        api_provider: provider,
        endpoint,
        credits_used: 1,
        request_type: requestType,
      });

      // Update credit usage
      const credit = await this.apiCreditDao.findByProvider(provider);

      if (credit && credit.id) {
        await this.apiCreditDao.incrementCreditsUsed(credit.id);
      }
    } catch (error) {
      console.error('Error tracking API usage:', error);
    }
  }
}

export default new MovieService();

