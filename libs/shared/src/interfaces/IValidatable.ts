/**
 * Base interface for all validatable DTOs
 * Provides a standard way to create DTO instances from plain objects
 */
export interface IValidatable<T = any> {
  /**
   * Creates and validates a DTO instance from plain object data
   * This method should be implemented by all DTOs to ensure consistent creation
   * @param data - Plain object data to transform into DTO
   * @returns Promise<T> - Validated DTO instance
   */
  fromPlainObject?(data: any): Promise<T>;
}

/**
 * Constructor interface for validatable DTOs
 * Ensures DTOs can be instantiated with new()
 */
export interface IValidatableConstructor<T extends IValidatable = IValidatable> {
  new (data?: any): T;
  
  /**
   * Static method to create and validate DTO from plain object
   * @param data - Plain object data
   * @returns Promise<T> - Validated DTO instance
   */
  fromPlainObject(data: any): Promise<T>;
}

/**
 * Marker interface for parameter DTOs (like IdParamDto)
 * Used for URL parameters validation
 * Note: No index signature to avoid conflicts with BaseDto methods
 */
export interface IParamDto extends IValidatable {
  // Marker interface - specific properties defined in implementing classes
}

/**
 * Marker interface for body DTOs (like CreateItemDto, UpdateItemDto)
 * Used for request body validation
 */
export interface IBodyDto extends IValidatable {
  // Marker interface - specific properties defined in implementing classes
}

/**
 * Marker interface for query DTOs (for future use)
 * Used for query parameters validation
 */
export interface IQueryDto extends IValidatable {
  // Marker interface - specific properties defined in implementing classes
}

/**
 * Generic validation result interface
 */
export interface IValidationResult<T> {
  isValid: boolean;
  data?: T;
  errors?: Array<{
    field: string;
    constraints: Record<string, string>;
    value?: any;
  }>;
}
