import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import path from 'path';
import { Environment, getCurrentEnvironment, getEnvironmentDisplayName } from '../enums';
import { appConfig } from './app.config';

/**
 * Environment to .env file mapping
 * Maps each environment enum to its corresponding .env file
 */
const ENV_FILE_MAP: Record<Environment, string> = {
  [Environment.DEVELOPMENT]: '.env.dev',
  [Environment.QA]: '.env.qa',
  [Environment.STAGING]: '.env.staging',
  [Environment.PRODUCTION]: '.env.prod'
};

/**
 * Load environment-specific .env file
 * Priority: .env.[environment] > .env
 * 
 * Examples:
 * - Environment.DEVELOPMENT → loads .env.dev
 * - Environment.QA → loads .env.qa
 * - Environment.STAGING → loads .env.staging
 * - Environment.PRODUCTION → loads .env.prod
 */
const currentEnv = getCurrentEnvironment();
const envFile = ENV_FILE_MAP[currentEnv];
const envPath = path.resolve(process.cwd(), 'apps/api', envFile);

// Try to load environment-specific file first
const result = dotenv.config({ path: envPath });

// Fallback to default .env if environment-specific file doesn't exist locally
if (result.error && currentEnv !== Environment.DEVELOPMENT) {
  console.log(`⚠️  ${envFile} not found, falling back to .env`);
  dotenv.config();
} else if (!result.error) {
  console.log(`✓ Loaded environment config from: ${envFile}`);
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
  
  return dbConfig;
};

/**
 * Sequelize instance with TypeScript support
 */
const config = getConfig();
const sequelize = new Sequelize(config);

export { sequelize, getConfig };
export default sequelize;

