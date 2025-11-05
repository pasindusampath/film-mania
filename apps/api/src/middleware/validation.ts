import { Request, Response, NextFunction } from 'express';
import { BaseDto, ValidationFailedError } from '@nx-mono-repo-deployment-test/shared/src/dtos/common';
import { IValidatableConstructor, IBodyDto, IParamDto } from '@nx-mono-repo-deployment-test/shared/src/interfaces';

/**
 * Extended Request interface with typed validation results
 */
export interface ValidatedRequest<TBody = unknown, TParams = unknown, TQuery = unknown> extends Omit<Request, 'body' | 'params' | 'query'> {
  body: TBody;
  params: TParams;
  query: TQuery;
}

/**
 * Generic validation middleware that uses BaseDto's fromPlainObject method
 * @param dtoClass - DTO class that extends BaseDto
 * @param source - Source of data ('body', 'params', or 'query')
 * @returns Express middleware function
 */
function createValidationMiddleware<T extends BaseDto>(
  dtoClass: IValidatableConstructor<T>,
  source: 'body' | 'params' | 'query'
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get data from the specified source
      const sourceData = req[source];
      
      // Use the DTO's static fromPlainObject method for validation
      const validatedDto = await dtoClass.fromPlainObject(sourceData);
      
      // Attach validated DTO to request
      (req as unknown as Record<string, unknown>)[source] = validatedDto;
      
      next();
    } catch (error: unknown) {
      if (error instanceof ValidationFailedError) {
        // Handle validation errors
        const validationError = error as ValidationFailedError;
        res.sendError(validationError.message, 400, validationError.errors);
        return;
      }
      
      // Handle unexpected errors
      console.error(`Validation error in ${source} middleware:`, error);
      res.sendError('Internal validation error', 500);
    }
  };
}

/**
 * Validates request body against a DTO class
 * @param dtoClass - The DTO class that extends BaseDto
 * @returns Express middleware function
 */
export function validateBody<T extends BaseDto & IBodyDto>(
  dtoClass: IValidatableConstructor<T>
) {
  const middleware = createValidationMiddleware(dtoClass, 'body');
  // Store DTO reference for Swagger generation
  (middleware as unknown as Record<string, unknown>).dtoClass = dtoClass;
  (middleware as unknown as Record<string, unknown>).source = 'body';
  return middleware;
}

/**
 * Validates request params against a DTO class
 * @param dtoClass - The DTO class that extends BaseDto
 * @returns Express middleware function
 */
export function validateParams<T extends BaseDto & IParamDto>(
  dtoClass: IValidatableConstructor<T>
) {
  const middleware = createValidationMiddleware(dtoClass, 'params');
  // Store DTO reference for Swagger generation
  (middleware as unknown as Record<string, unknown>).dtoClass = dtoClass;
  (middleware as unknown as Record<string, unknown>).source = 'params';
  return middleware;
}

/**
 * Validates request query against a DTO class
 * @param dtoClass - The DTO class that extends BaseDto
 * @returns Express middleware function
 */
export function validateQuery<T extends BaseDto>(
  dtoClass: IValidatableConstructor<T>
) {
  const middleware = createValidationMiddleware(dtoClass, 'query');
  // Store DTO reference for Swagger generation
  (middleware as unknown as Record<string, unknown>).dtoClass = dtoClass;
  (middleware as unknown as Record<string, unknown>).source = 'query';
  return middleware;
}

/**
 * Type-safe validation middleware factory
 * Creates strongly typed middleware for specific DTO combinations
 */
export class ValidationMiddleware {
  /**
   * Creates a type-safe body validation middleware
   */
  static body<T extends BaseDto & IBodyDto>(dtoClass: IValidatableConstructor<T>) {
    return validateBody(dtoClass);
  }

  /**
   * Creates a type-safe params validation middleware
   */
  static params<T extends BaseDto & IParamDto>(dtoClass: IValidatableConstructor<T>) {
    return validateParams(dtoClass);
  }

  /**
   * Creates a type-safe query validation middleware
   */
  static query<T extends BaseDto>(dtoClass: IValidatableConstructor<T>) {
    return validateQuery(dtoClass);
  }

  /**
   * Creates combined validation middleware for body and params
   */
  static bodyAndParams<
    TBody extends BaseDto & IBodyDto,
    TParams extends BaseDto & IParamDto
  >(
    bodyDtoClass: IValidatableConstructor<TBody>,
    paramsDtoClass: IValidatableConstructor<TParams>
  ) {
    return [
      ValidationMiddleware.params(paramsDtoClass),
      ValidationMiddleware.body(bodyDtoClass),
    ];
  }
}

