/**
 * Movie-related interfaces
 * Used for TMDB API responses and internal movie data
 */

/**
 * TMDB Movie data structure
 */
export interface ITMDBMovie {
  id: number;
  title: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  original_language?: string;
  original_title?: string;
  popularity?: number;
  vote_average?: number;
  vote_count?: number;
  adult?: boolean;
  video?: boolean;
  genre_ids?: number[];
  runtime?: number;
  genres?: Array<{
    id: number;
    name: string;
  }>;
  production_companies?: Array<{
    id: number;
    name: string;
    logo_path?: string | null;
  }>;
  production_countries?: Array<{
    iso_3166_1: string;
    name: string;
  }>;
  spoken_languages?: Array<{
    iso_639_1: string;
    name: string;
  }>;
  status?: string;
  tagline?: string;
  budget?: number;
  revenue?: number;
  homepage?: string;
  imdb_id?: string;
}

/**
 * TMDB Paginated Response
 */
export interface ITMDBPaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

/**
 * TMDB Movie List Response
 */
export interface ITMDBMovieListResponse extends ITMDBPaginatedResponse<ITMDBMovie> {}

/**
 * TMDB Movie Details Response
 */
export interface ITMDBMovieDetails extends ITMDBMovie {
  belongs_to_collection?: {
    id: number;
    name: string;
    poster_path?: string | null;
    backdrop_path?: string | null;
  } | null;
  budget?: number;
  revenue?: number;
  runtime?: number;
  status?: string;
  tagline?: string;
  genres?: Array<{
    id: number;
    name: string;
  }>;
  production_companies?: Array<{
    id: number;
    name: string;
    logo_path?: string | null;
    origin_country?: string;
  }>;
  production_countries?: Array<{
    iso_3166_1: string;
    name: string;
  }>;
  spoken_languages?: Array<{
    iso_639_1: string;
    name: string;
  }>;
}

/**
 * Streaming Link interface
 */
export interface IStreamingLink {
  provider: string;
  url: string;
  quality?: string;
  language?: string;
  subtitles?: string[];
}

/**
 * Movie category types
 */
export type MovieCategory = 'Tamil' | 'Malayalam' | 'Hindi' | 'English' | 'Korean' | 'Japanese' | 'Anime';

/**
 * Content type
 */
export type ContentType = 'movie' | 'anime' | 'tv';

