import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { Environment, getCurrentEnvironment, getEnvironmentDisplayName } from '../enums';
import { appConfig } from './app.config';

/**
 * Environment to .env file mapping
 * Maps each environment enum to its corresponding .env file
 * Development uses .env by default, but can use .env.dev if present
 */
const ENV_FILE_MAP: Record<Environment, string> = {
  [Environment.DEVELOPMENT]: '.env', // Default to .env for development
  [Environment.QA]: '.env.qa',
  [Environment.STAGING]: '.env.staging',
  [Environment.PRODUCTION]: '.env.prod'
};

/**
 * Load environment-specific .env file
 * Priority: .env.[environment] > .env (for non-dev environments)
 * 
 * Examples:
 * - Environment.DEVELOPMENT → loads .env (or .env.dev if exists)
 * - Environment.QA → loads .env.qa
 * - Environment.STAGING → loads .env.staging
 * - Environment.PRODUCTION → loads .env.prod
 */
const currentEnv = getCurrentEnvironment();
const envFile = ENV_FILE_MAP[currentEnv];

// Find project root - detect if we're in apps/api or at project root
function findProjectRoot(): string {
  const cwd = process.cwd();
  
  // If we're already in apps/api, go up two levels
  if (cwd.endsWith('apps/api') || cwd.endsWith('apps\\api')) {
    return path.resolve(cwd, '../..');
  }
  
  // If we're at project root, use it
  const envFileAtRoot = path.join(cwd, 'apps', 'api', '.env');
  if (path.basename(cwd) === 'film-mania' || fs.existsSync(envFileAtRoot)) {
    return cwd;
  }
  
  // Try to find by looking for apps/api directory
  let current = cwd;
  while (current !== path.dirname(current)) {
    const envFile = path.join(current, 'apps', 'api', '.env');
    if (fs.existsSync(envFile)) {
      return current;
    }
    current = path.dirname(current);
  }
  
  // Fallback to current directory
  return cwd;
}

// Resolve path - try multiple methods to ensure we find the file
const projectRoot = findProjectRoot();
const envPath = path.resolve(projectRoot, 'apps/api', envFile);

// Try to load environment-specific file first
const result = dotenv.config({ path: envPath });

// Fallback to default .env if environment-specific file doesn't exist
if (result.error) {
  const defaultEnvPath = path.resolve(projectRoot, 'apps/api', '.env');
  const fallbackResult = dotenv.config({ path: defaultEnvPath });
  
  if (fallbackResult.error) {
    // Try without path (will use default .env in current working directory)
    const finalResult = dotenv.config();
    if (finalResult.error) {
      console.log(`⚠️  Could not load .env file from:`);
      console.log(`   - ${envPath}`);
      console.log(`   - ${defaultEnvPath}`);
      console.log(`   Using environment variables or defaults`);
    } else {
      console.log(`✓ Loaded .env from current working directory`);
    }
  } else {
    console.log(`✓ Loaded .env from: ${defaultEnvPath}`);
  }
} else {
  console.log(`✓ Loaded environment config from: ${envPath}`);
}

// In production/VPS, environment variables may be set directly by docker-compose
// which overrides file-based .env, so this is fine
if (result.error && !process.env.DB_NAME) {
  console.warn(`⚠️  No .env file found and no DB_NAME environment variable set`);
}

/**
 * Database configuration for different environments
 */
const getConfig = () => {
  const env = getCurrentEnvironment();
  
  const dbConfig = {
    dialect: appConfig.database.dialect as 'postgres',
    host: appConfig.database.host,
    port: appConfig.database.port,
    database: appConfig.database.name,
    username: appConfig.database.username,
    password: appConfig.database.password,
    logging: env === Environment.DEVELOPMENT ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    models: [path.join(__dirname, '../models/**/*.model.{ts,js}')],
    define: {
      timestamps: true,
      underscored: false,
    },
  };

  // Log configuration details (but not password)
  console.log(`📊 Database Configuration:`);
  console.log(`   Environment: ${getEnvironmentDisplayName(env).toUpperCase()}`);
  console.log(`   Database: ${dbConfig.database}`);
  console.log(`   Host: ${dbConfig.host}:${dbConfig.port}`);
  console.log(`   User: ${dbConfig.username}`);
  console.log(`   Password: ${dbConfig.password ? '***' : '(not set)'}`);
  
  // Debug: Show if we're using defaults or env vars
  if (env === Environment.DEVELOPMENT) {
    console.log(`   🔍 Debug: Using DB_USERNAME=${process.env.DB_USERNAME || '(default)'}`);
    console.log(`   🔍 Debug: Using DB_PASSWORD=${process.env.DB_PASSWORD ? '***' : '(default)'}`);
  }
  
  return dbConfig;
};

/**
 * Sequelize instance with TypeScript support
 */
const config = getConfig();
const sequelize = new Sequelize(config);

export { sequelize, getConfig };
export default sequelize;

