import 'reflect-metadata'; // Required for decorators - MUST BE FIRST!
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables FIRST, before any other imports that use process.env
// This ensures .env file is loaded regardless of where the command is run from

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

const projectRoot = findProjectRoot();
const envPath = path.resolve(projectRoot, 'apps/api', '.env');
const envResult = dotenv.config({ path: envPath });

if (envResult.error) {
  console.warn(`⚠️  Could not load .env from ${envPath}`);
  console.warn(`   Current working directory: ${process.cwd()}`);
  console.warn(`   Project root detected: ${projectRoot}`);
  console.warn(`   Attempted path: ${envPath}`);
  console.warn(`   Using environment variables or defaults`);
} else {
  console.log(`✓ Loaded .env from: ${envPath}`);
}

// Now import modules that use process.env (after .env is loaded)
import Server from './server';
import { appConfig } from './config/app.config';

// Get server instance
const server = Server.getInstance();

/**
 * Graceful shutdown handler
 */
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  try {
    await server.stop();
    console.log('✓ Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

/**
 * Force cleanup on process exit
 */
const forceCleanup = () => {
  console.log('\n⚠️  Force cleanup on process exit');
  // Don't await here as process is already exiting
  server.stop().catch(() => {
    // Ignore errors during force cleanup
  });
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle ts-node-dev restart signal
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2 (restart)'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

// Force cleanup on process exit (last resort)
process.on('exit', forceCleanup);
process.on('beforeExit', forceCleanup);

// Start the server
server.start(appConfig.port).catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

// Export for testing
export default server;
