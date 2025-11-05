import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'class-validator';
import { appConfig } from '../config/app.config';

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handling middleware
 * Must be registered last in middleware chain
 * MUST have 4 parameters (err, req, res, next) for Express to recognize it as error handler
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Error caught by global handler:', err);

  // Use sendError if available (from normalizeResponse middleware)
  // Otherwise fall back to direct JSON response
  const sendError = (res as { sendError?: (error: string, statusCode?: number, details?: unknown) => void }).sendError;

  // Handle AppError instances
  if (err instanceof AppError) {
    if (sendError) {
      sendError.call(res, err.message, err.statusCode, err.details);
    } else {
      res.status(err.statusCode).json({
        success: false,
        error: err.message,
        details: err.details,
      });
    }
    return;
  }

  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    if (sendError) {
      sendError.call(res, 'Database validation error', 400, err.message);
    } else {
      res.status(400).json({
        success: false,
        error: 'Database validation error',
        details: err.message,
      });
    }
    return;
  }

  // Handle Sequelize database connection errors
  if (err.name === 'SequelizeConnectionError' || err.name === 'SequelizeDatabaseError') {
    if (sendError) {
      sendError.call(res, 'Database connection error', 503, appConfig.nodeEnv === 'development' ? err.message : undefined);
    } else {
      res.status(503).json({
        success: false,
        error: 'Database connection error',
        details: appConfig.nodeEnv === 'development' ? err.message : undefined,
      });
    }
    return;
  }

  // Handle class-validator errors
  if (Array.isArray(err) && err[0] instanceof ValidationError) {
    const formattedErrors = err.map((error: ValidationError) => ({
      field: error.property,
      constraints: error.constraints,
    }));

    if (sendError) {
      sendError.call(res, 'Validation failed', 400, formattedErrors);
    } else {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: formattedErrors,
      });
    }
    return;
  }

  // Handle generic errors
  if (sendError) {
    sendError.call(res, 'Internal server error', 500, appConfig.nodeEnv === 'development' ? { message: err.message, stack: err.stack } : undefined);
  } else {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: appConfig.nodeEnv === 'development' ? err.message : undefined,
      stack: appConfig.nodeEnv === 'development' ? err.stack : undefined,
    });
  }
}

