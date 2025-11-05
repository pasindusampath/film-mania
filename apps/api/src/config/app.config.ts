/**
 * Application Configuration
 * Centralized configuration for all environment variables
 */

import type { StringValue } from 'ms';
import { StreamingProvider } from '@nx-mono-repo-deployment-test/shared';

/**
 * Application configuration interface
 */
export interface AppConfig {
  // Server
  port: number;
  nodeEnv: string;
  apiVersion: string;
  corsOrigin: string[];

  // JWT
  jwt: {
    secret: string;
    refreshSecret: string;
    accessTokenExpiry: StringValue;
    refreshTokenExpiry: StringValue;
  };

  // Stripe
  stripe: {
    secretKey: string;
    webhookSecret?: string;
    apiVersion: string;
  };

  // TMDB
  tmdb: {
    apiKey: string;
    baseUrl: string;
  };

  // Streaming APIs
  streaming: {
    provider: StreamingProvider;
    tmdb?: {
      apiKey: string;
      baseUrl: string;
    };
    vidapi?: {
      apiKey?: string;
      baseUrl?: string;
    };
    streamapi?: {
      apiKey?: string;
      baseUrl?: string;
    };
    watchmode?: {
      apiKey?: string;
      baseUrl?: string;
    };
  };

  // Database
  database: {
    host: string;
    port: number;
    name: string;
    username: string;
    password: string;
    dialect: string;
  };
}

/**
 * Load and validate application configuration
 */
function loadConfig(): AppConfig {
  // Server configuration
  const port = parseInt(process.env.PORT || '3000', 10);
  const nodeEnv = process.env.NODE_ENV || 'development';
  const apiVersion = process.env.API_VERSION || '1.0.0';
  const corsOrigin = process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : ['*'];

  // JWT configuration
  const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production';
  const accessTokenExpiry = (process.env.JWT_EXPIRY || '24h') as StringValue;
  const refreshTokenExpiry = (process.env.JWT_REFRESH_EXPIRY || '7d') as StringValue;

  // Stripe configuration
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
  if (!stripeSecretKey && nodeEnv === 'production') {
    throw new Error('STRIPE_SECRET_KEY environment variable is required in production');
  }
  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeApiVersion = process.env.STRIPE_API_VERSION || '2025-02-24.acacia';

  // TMDB configuration
  const tmdbApiKey = process.env.TMDB_API_KEY || '';
  const tmdbBaseUrl = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';

  // Streaming API configuration
  const streamingProviderEnv = process.env.STREAMING_PROVIDER || StreamingProvider.TMDB;
  const streamingProvider = Object.values(StreamingProvider).includes(streamingProviderEnv as StreamingProvider)
    ? (streamingProviderEnv as StreamingProvider)
    : StreamingProvider.TMDB;
  
  const streamingConfig = {
    provider: streamingProvider,
    tmdb: {
      apiKey: tmdbApiKey,
      baseUrl: tmdbBaseUrl,
    },
    vidapi: {
      apiKey: process.env.VIDAPI_API_KEY,
      baseUrl: process.env.VIDAPI_BASE_URL || 'https://api.vidapi.io',
    },
    streamapi: {
      apiKey: process.env.STREAMAPI_API_KEY,
      baseUrl: process.env.STREAMAPI_BASE_URL || 'https://api.streamapi.com',
    },
    watchmode: {
      apiKey: process.env.WATCHMODE_API_KEY,
      baseUrl: process.env.WATCHMODE_BASE_URL || 'https://api.watchmode.com/v1',
    },
  };

  // Database configuration
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = parseInt(process.env.DB_PORT || '5432', 10);
  const dbName = process.env.DB_NAME || 'film_mania';
  const dbUsername = process.env.DB_USERNAME || 'postgres';
  const dbPassword = process.env.DB_PASSWORD || 'postgres';
  const dbDialect = process.env.DB_DIALECT || 'postgres';

  return {
    port,
    nodeEnv,
    apiVersion,
    corsOrigin,
    jwt: {
      secret: jwtSecret,
      refreshSecret: jwtRefreshSecret,
      accessTokenExpiry,
      refreshTokenExpiry,
    },
    stripe: {
      secretKey: stripeSecretKey,
      webhookSecret: stripeWebhookSecret,
      apiVersion: stripeApiVersion,
    },
    tmdb: {
      apiKey: tmdbApiKey,
      baseUrl: tmdbBaseUrl,
    },
    streaming: streamingConfig,
    database: {
      host: dbHost,
      port: dbPort,
      name: dbName,
      username: dbUsername,
      password: dbPassword,
      dialect: dbDialect,
    },
  };
}

/**
 * Application configuration singleton
 * Loaded once when the module is imported
 */
export const appConfig: AppConfig = loadConfig();

/**
 * Get configuration value (for convenience)
 */
export function getConfig(): AppConfig {
  return appConfig;
}

