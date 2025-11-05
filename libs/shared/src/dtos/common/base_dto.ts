import { plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { IValidatable, IValidationResult } from '../../interfaces';

/**
 * Base DTO class that provides common validation functionality
 * All DTOs should extend this class to get consistent validation behavior
 */
export abstract class BaseDto implements IValidatable {
  /**
   * Creates and validates a DTO instance from plain object data
   * @param data - Plain object data to transform into DTO
   * @returns Promise<this> - Validated DTO instance
   */
  public async fromPlainObject(data: any): Promise<this> {
    const result = await (this.constructor as any).fromPlainObject(data);
    return result;
  }

  /**
   * Static method to create and validate DTO from plain object
   * This method should be called by middleware to create validated DTOs
   * @param data - Plain object data
   * @returns Promise<T> - Validated DTO instance
   */
  public static async fromPlainObject<T extends BaseDto>(
    this: new (data?: any) => T,
    data: any
  ): Promise<T> {
    // Transform plain object to DTO instance
    const dtoInstance = plainToClass(this, data);
    
    // Validate the DTO
    const errors: ValidationError[] = await validate(dtoInstance);
    
    if (errors.length > 0) {
      const validationError = new ValidationFailedError(
        'Validation failed',
        errors.map(error => ({
          field: error.property,
          constraints: error.constraints || {},
          value: error.value,
        }))
      );
      throw validationError;
    }
    
    return dtoInstance;
  }

  /**
   * Validates the current DTO instance
   * @returns Promise<IValidationResult<this>>
   */
  public async validate(): Promise<IValidationResult<this>> {
    try {
      const errors: ValidationError[] = await validate(this);
      
      if (errors.length > 0) {
        return {
          isValid: false,
          errors: errors.map(error => ({
            field: error.property,
            constraints: error.constraints || {},
            value: error.value,
          })),
        };
      }
      
      return {
        isValid: true,
        data: this,
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [{
          field: 'unknown',
          constraints: { error: 'Validation error occurred' },
        }],
      };
    }
  }

  /**
   * Converts DTO to plain object
   * @returns Plain object representation
   */
  public toPlainObject(): Record<string, any> {
    return JSON.parse(JSON.stringify(this));
  }
}

/**
 * Custom error class for validation failures
 */
export class ValidationFailedError extends Error {
  public readonly errors: Array<{
    field: string;
    constraints: Record<string, string>;
    value?: any;
  }>;

  constructor(
    message: string,
    errors: Array<{
      field: string;
      constraints: Record<string, string>;
      value?: any;
    }>
  ) {
    super(message);
    this.name = 'ValidationFailedError';
    this.errors = errors;
    Error.captureStackTrace(this, ValidationFailedError);
  }
}
