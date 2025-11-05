/**
 * Streaming Provider enum
 * Represents the different streaming API providers available
 */
export enum StreamingProvider {
  TMDB = 'tmdb',
  VIDAPI = 'vidapi',
  STREAMAPI = 'streamapi',
  WATCHMODE = 'watchmode',
}

/**
 * Type guard to check if a value is a valid streaming provider
 */
export function isStreamingProvider(value: unknown): value is StreamingProvider {
  return Object.values(StreamingProvider).includes(value as StreamingProvider);
}

