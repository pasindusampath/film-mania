import axios, { AxiosInstance } from 'axios';
import { IStreamingLink, StreamingProvider } from '@nx-mono-repo-deployment-test/shared';
import { appConfig } from '../config/app.config';

/**
 * Streaming Service Interface
 * Defines the contract for streaming link providers
 */
interface IStreamingProvider {
  getStreamingLinks(tmdbId: number): Promise<IStreamingLink[]>;
}

/**
 * TMDB Watch Providers Implementation
 * Uses TMDB's watch/providers endpoint to get official streaming availability
 */
class TMDBStreamingProvider implements IStreamingProvider {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: appConfig.streaming.tmdb?.baseUrl || appConfig.tmdb.baseUrl,
      params: {
        api_key: appConfig.streaming.tmdb?.apiKey || appConfig.tmdb.apiKey,
      },
    });
  }

  async getStreamingLinks(tmdbId: number): Promise<IStreamingLink[]> {
    try {
      const response = await this.client.get(`/movie/${tmdbId}/watch/providers`);
      const providers = response.data.results;

      const links: IStreamingLink[] = [];

      // Process US providers (or first available region)
      const regionData = providers.US || providers[Object.keys(providers)[0]] || {};
      
      // Flatrate providers (subscription services)
      if (regionData.flatrate) {
        regionData.flatrate.forEach((provider: { provider_name: string; logo_path: string }) => {
          links.push({
            provider: provider.provider_name,
            url: `https://www.themoviedb.org/movie/${tmdbId}/watch?locale=US`,
            quality: 'HD',
            language: 'en',
          });
        });
      }

      // Rent providers
      if (regionData.rent) {
        regionData.rent.forEach((provider: { provider_name: string; logo_path: string }) => {
          links.push({
            provider: `${provider.provider_name} (Rent)`,
            url: `https://www.themoviedb.org/movie/${tmdbId}/watch?locale=US`,
            quality: 'HD',
            language: 'en',
          });
        });
      }

      // Buy providers
      if (regionData.buy) {
        regionData.buy.forEach((provider: { provider_name: string; logo_path: string }) => {
          links.push({
            provider: `${provider.provider_name} (Buy)`,
            url: `https://www.themoviedb.org/movie/${tmdbId}/watch?locale=US`,
            quality: 'HD',
            language: 'en',
          });
        });
      }

      return links;
    } catch (error) {
      console.error('TMDB streaming links error:', error);
      return [];
    }
  }
}

/**
 * VidAPI Implementation
 * Example implementation for VidAPI service
 */
class VidAPIStreamingProvider implements IStreamingProvider {
  private client: AxiosInstance;

  constructor() {
    const apiKey = appConfig.streaming.vidapi?.apiKey;
    if (!apiKey) {
      throw new Error('VIDAPI_API_KEY is required when using VidAPI provider');
    }

    this.client = axios.create({
      baseURL: appConfig.streaming.vidapi?.baseUrl || 'https://api.vidapi.io',
      headers: {
        'X-API-Key': apiKey,
      },
    });
  }

  async getStreamingLinks(tmdbId: number): Promise<IStreamingLink[]> {
    try {
      // Example VidAPI endpoint - adjust based on actual API documentation
      const response = await this.client.get(`/movie/${tmdbId}/streaming`);
      
      return response.data.streams?.map((stream: {
        provider: string;
        url: string;
        quality?: string;
        language?: string;
      }) => ({
        provider: stream.provider,
        url: stream.url,
        quality: stream.quality || 'HD',
        language: stream.language || 'en',
      })) || [];
    } catch (error) {
      console.error('VidAPI streaming links error:', error);
      return [];
    }
  }
}

/**
 * StreamAPI Implementation
 * Example implementation for StreamAPI service
 */
class StreamAPIStreamingProvider implements IStreamingProvider {
  private client: AxiosInstance;

  constructor() {
    const apiKey = appConfig.streaming.streamapi?.apiKey;
    if (!apiKey) {
      throw new Error('STREAMAPI_API_KEY is required when using StreamAPI provider');
    }

    this.client = axios.create({
      baseURL: appConfig.streaming.streamapi?.baseUrl || 'https://api.streamapi.com',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
  }

  async getStreamingLinks(tmdbId: number): Promise<IStreamingLink[]> {
    try {
      // Example StreamAPI endpoint - adjust based on actual API documentation
      const response = await this.client.get(`/streams/movie/${tmdbId}`);
      
      return response.data.links?.map((link: {
        source: string;
        url: string;
        quality?: string;
        language?: string;
      }) => ({
        provider: link.source,
        url: link.url,
        quality: link.quality || 'HD',
        language: link.language || 'en',
      })) || [];
    } catch (error) {
      console.error('StreamAPI streaming links error:', error);
      return [];
    }
  }
}

/**
 * Watchmode Implementation
 * Watchmode API for streaming availability
 */
class WatchmodeStreamingProvider implements IStreamingProvider {
  private client: AxiosInstance;

  constructor() {
    const apiKey = appConfig.streaming.watchmode?.apiKey;
    if (!apiKey) {
      throw new Error('WATCHMODE_API_KEY is required when using Watchmode provider');
    }

    this.client = axios.create({
      baseURL: appConfig.streaming.watchmode?.baseUrl || 'https://api.watchmode.com/v1',
      params: {
        apiKey,
      },
    });
  }

  async getStreamingLinks(tmdbId: number): Promise<IStreamingLink[]> {
    try {
      // Watchmode uses source_id, need to map TMDB ID to Watchmode source_id
      // This is a simplified example - actual implementation may need ID mapping
      const response = await this.client.get(`/title/${tmdbId}/sources`);
      
      return response.data.sources?.map((source: {
        name: string;
        web_url: string;
        type: string;
      }) => ({
        provider: source.name,
        url: source.web_url,
        quality: 'HD',
        language: 'en',
      })) || [];
    } catch (error) {
      console.error('Watchmode streaming links error:', error);
      return [];
    }
  }
}

/**
 * Streaming Service
 * Main service that delegates to the appropriate provider
 */
class StreamingService {
  private provider: IStreamingProvider;

  constructor() {
    const providerType = appConfig.streaming.provider;

    switch (providerType) {
      case StreamingProvider.VIDAPI:
        this.provider = new VidAPIStreamingProvider();
        break;
      case StreamingProvider.STREAMAPI:
        this.provider = new StreamAPIStreamingProvider();
        break;
      case StreamingProvider.WATCHMODE:
        this.provider = new WatchmodeStreamingProvider();
        break;
      case StreamingProvider.TMDB:
      default:
        this.provider = new TMDBStreamingProvider();
        break;
    }
  }

  /**
   * Get streaming links for a movie by TMDB ID
   */
  async getStreamingLinks(tmdbId: number): Promise<IStreamingLink[]> {
    try {
      return await this.provider.getStreamingLinks(tmdbId);
    } catch (error) {
      console.error('Streaming service error:', error);
      return [];
    }
  }

  /**
   * Get current provider
   */
  getProvider(): StreamingProvider {
    return appConfig.streaming.provider;
  }
}

export default new StreamingService();

