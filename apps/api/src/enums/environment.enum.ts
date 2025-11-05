/**
 * Application Environment Enum
 * Defines all possible deployment environments
 */
export enum Environment {
  DEVELOPMENT = 'development',
  QA = 'qa',
  STAGING = 'staging',
  PRODUCTION = 'production'
}

/**
 * Type guard to check if a string is a valid environment
 */
export function isValidEnvironment(env: string): env is Environment {
  return Object.values(Environment).includes(env as Environment);
}

/**
 * Get environment from NODE_ENV with type safety
 */
export function getCurrentEnvironment(): Environment {
  const nodeEnv = process.env.NODE_ENV?.toLowerCase() || 'development';
  
  if (isValidEnvironment(nodeEnv)) {
    return nodeEnv as Environment;
  }
  
  console.warn(`⚠️  Invalid NODE_ENV "${nodeEnv}", defaulting to development`);
  return Environment.DEVELOPMENT;
}

/**
 * Check if current environment is production
 */
export function isProduction(): boolean {
  return getCurrentEnvironment() === Environment.PRODUCTION;
}

/**
 * Check if current environment is development
 */
export function isDevelopment(): boolean {
  return getCurrentEnvironment() === Environment.DEVELOPMENT;
}

/**
 * Check if current environment is QA
 */
export function isQA(): boolean {
  return getCurrentEnvironment() === Environment.QA;
}

/**
 * Check if current environment is staging
 */
export function isStaging(): boolean {
  return getCurrentEnvironment() === Environment.STAGING;
}

/**
 * Get human-readable environment name
 */
export function getEnvironmentDisplayName(env: Environment): string {
  const displayNames: Record<Environment, string> = {
    [Environment.DEVELOPMENT]: 'Development',
    [Environment.QA]: 'QA',
    [Environment.STAGING]: 'Staging',
    [Environment.PRODUCTION]: 'Production'
  };
  
  return displayNames[env];
}

