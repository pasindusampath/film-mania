import { Request, Response, NextFunction } from 'express';
import { IApiResponse } from '@nx-mono-repo-deployment-test/shared/src/interfaces';

/**
 * Extends Express Response with custom methods for normalized responses
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Response {
      sendSuccess<T>(data: T, message?: string, statusCode?: number): void;
      sendError(error: string, statusCode?: number, details?: unknown): void;
    }
  }
}

/**
 * Response normalization middleware
 * Adds helper methods to response object for consistent API responses
 */
export function normalizeResponse(req: Request, res: Response, next: NextFunction): void {
  /**
   * Send a successful response with standardized format
   * @param data - The response data
   * @param message - Optional success message
   * @param statusCode - HTTP status code (default: 200)
   */
  res.sendSuccess = function <T>(data: T, message?: string, statusCode: number = 200): void {
    const response: IApiResponse<T> = {
      success: true,
      data,
    };

    if (message) {
      response.message = message;
    }

    // Add count if data is an array
    if (Array.isArray(data)) {
      response.count = data.length;
    }

    this.status(statusCode).json(response);
  };

  /**
   * Send an error response with standardized format
   * @param error - Error message
   * @param statusCode - HTTP status code (default: 500)
   * @param details - Optional error details
   */
  res.sendError = function (error: string, statusCode: number = 500, details?: unknown): void {
    const response: IApiResponse = {
      success: false,
      error,
    };

    if (details) {
      response.details = details;
    }

    this.status(statusCode).json(response);
  };

  next();
}

