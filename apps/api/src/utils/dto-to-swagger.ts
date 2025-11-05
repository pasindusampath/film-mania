import 'reflect-metadata';
import { getMetadataStorage } from 'class-validator';

// ValidationMetadata is not exported from class-validator main module
// Using a flexible interface that matches the actual structure
interface ValidationMetadata {
  propertyName: string;
  constraintCls?: { name: string } | (() => void);
  constraints: unknown[];
  type?: string | (() => unknown);
  message?: string | ((args: unknown) => string);
}

/**
 * Converts class-validator decorators to OpenAPI schema
 * This utility extracts validation rules from DTOs and converts them to Swagger schemas
 */
export class DtoToSwaggerConverter {
  /**
   * Converts a DTO class to OpenAPI schema
   * @param dtoClass - The DTO class to convert
   * @returns OpenAPI schema object
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static convertToSchema(dtoClass: new (...args: any[]) => any): Record<string, unknown> {
    try {
      const metadataStorage = getMetadataStorage();
      const properties: Record<string, unknown> = {};
      const required: string[] = [];
      const propertyMetadataMap: Record<string, ValidationMetadata[]> = {};

      // Get all validation metadata for this class
      const metadatas = metadataStorage.getTargetValidationMetadatas(
        dtoClass,
        '',
        false,
        false
      ) as unknown as ValidationMetadata[];

      // Group metadata by property name
      metadatas.forEach((metadata) => {
        const propertyName = metadata.propertyName;
        if (!propertyMetadataMap[propertyName]) {
          propertyMetadataMap[propertyName] = [];
        }
        propertyMetadataMap[propertyName].push(metadata);
      });

      // Convert each property's metadata to OpenAPI schema
      Object.keys(propertyMetadataMap).forEach((propertyName) => {
        const metadata = propertyMetadataMap[propertyName];
        const propertySchema = this.convertPropertyMetadata(metadata, propertyName);
        
        if (propertySchema) {
          properties[propertyName] = propertySchema.schema;
          
          // Check if property is required
          if (propertySchema.required) {
            required.push(propertyName);
          }
        }
      });

      // Also check instance properties for type inference
      try {
        const instance = new dtoClass();
        Object.keys(instance).forEach((key) => {
          if (!properties[key]) {
            // Infer type from value
            const value = instance[key];
            const type = this.inferType(value);
            if (type) {
              properties[key] = { type };
            }
          }
        });
      } catch {
        // If instantiation fails, continue with what we have
      }

      return {
        type: 'object',
        properties: Object.keys(properties).length > 0 ? properties : undefined,
        ...(required.length > 0 && { required }),
      };
    } catch (error) {
      // Fallback: return empty schema
      console.warn(`Failed to convert DTO ${dtoClass.name} to schema:`, error);
      return { type: 'object' };
    }
  }

  /**
   * Converts property validation metadata to OpenAPI schema
   */
  private static convertPropertyMetadata(
    metadataArray: ValidationMetadata[],
    _propertyName: string
  ): { schema: Record<string, unknown>; required: boolean } | null {
    const schema: Record<string, unknown> = {};
    let isRequired = false;

    // First pass: Check for required/optional and type transformers
    metadataArray.forEach((metadata) => {
      const constraint = metadata.constraintCls;
      if (!constraint) return;
      
      const constraintName = typeof constraint === 'object' && 'name' in constraint 
        ? constraint.name 
        : typeof constraint === 'function' 
          ? constraint.name 
          : '';

      // Check for required/optional
      if (constraintName === 'IsNotEmpty' || constraintName === 'IsDefined') {
        isRequired = true;
      }

      if (constraintName === 'IsOptional') {
        isRequired = false;
      }

      // Handle Type transformer from class-transformer (@Type decorator)
      // The type field in metadata can be a string or a function
      if (metadata.type) {
        if (typeof metadata.type === 'function') {
          try {
            const type = metadata.type();
            if (type === Number || (type && (type as { prototype?: unknown }).prototype === Number.prototype)) {
              schema.type = 'integer';
            } else if (type === String || (type && (type as { prototype?: unknown }).prototype === String.prototype)) {
              schema.type = 'string';
            } else if (type === Boolean || (type && (type as { prototype?: unknown }).prototype === Boolean.prototype)) {
              schema.type = 'boolean';
            } else if (type === Date || (type && (type as { prototype?: unknown }).prototype === Date.prototype)) {
              schema.type = 'string';
              schema.format = 'date-time';
            }
          } catch {
            // Ignore type function errors
          }
        }
      }
    });

    // Second pass: Convert validation decorators to OpenAPI constraints
    metadataArray.forEach((metadata) => {
      const constraint = metadata.constraintCls;
      if (!constraint) return;
      
      const constraintName = typeof constraint === 'object' && 'name' in constraint 
        ? constraint.name 
        : typeof constraint === 'function' 
          ? constraint.name 
          : '';

      // Convert validation decorators to OpenAPI constraints
      switch (constraintName) {
        case 'IsString':
          if (!schema.type) schema.type = 'string';
          break;
        case 'IsInt':
          schema.type = 'integer';
          break;
        case 'IsNumber':
          schema.type = 'number';
          break;
        case 'IsPositive':
          schema.minimum = 1;
          if (!schema.type) schema.type = 'integer';
          break;
        case 'IsEmail':
          schema.type = 'string';
          schema.format = 'email';
          break;
        case 'IsBoolean':
          schema.type = 'boolean';
          break;
        case 'IsDate':
          schema.type = 'string';
          schema.format = 'date-time';
          break;
        case 'IsArray':
          schema.type = 'array';
          break;
        case 'Length': {
          // Length constraints are in the first constraint element as [min, max]
          const constraints = metadata.constraints;
          if (constraints && constraints.length > 0) {
            const lengthArgs = constraints[0];
            if (Array.isArray(lengthArgs) && lengthArgs.length >= 2) {
              schema.minLength = lengthArgs[0];
              schema.maxLength = lengthArgs[1];
            } else if (typeof lengthArgs === 'object' && lengthArgs !== null) {
              // Sometimes it's an object with min/max properties
              const args = lengthArgs as { min?: number; max?: number };
              if (args.min !== undefined) schema.minLength = args.min;
              if (args.max !== undefined) schema.maxLength = args.max;
            }
          }
          break;
        }
        case 'Min':
          if (metadata.constraints && metadata.constraints.length > 0) {
            schema.minimum = metadata.constraints[0] as number;
          }
          break;
        case 'Max':
          if (metadata.constraints && metadata.constraints.length > 0) {
            schema.maximum = metadata.constraints[0] as number;
          }
          break;
        case 'MinLength':
          if (metadata.constraints && metadata.constraints.length > 0) {
            schema.minLength = metadata.constraints[0] as number;
          }
          break;
        case 'MaxLength':
          if (metadata.constraints && metadata.constraints.length > 0) {
            schema.maxLength = metadata.constraints[0] as number;
          }
          break;
        case 'IsEnum':
          if (metadata.constraints && metadata.constraints.length > 0) {
            schema.enum = metadata.constraints[0];
          }
          break;
      }
    });

    // Set default type if not set
    if (!schema.type) {
      schema.type = 'string';
    }

    // Add description from metadata if available
    if (metadataArray.length > 0) {
      const firstMetadata = metadataArray[0];
      if (firstMetadata.message) {
        const message = typeof firstMetadata.message === 'string' 
          ? firstMetadata.message 
          : '';
        if (message) {
          schema.description = message;
        }
      }
    }

    return { schema, required: isRequired };
  }

  /**
   * Infers OpenAPI type from a value
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static inferType(value: any): string | null {
    if (value === null || value === undefined) {
      return null;
    }

    const type = typeof value;
    switch (type) {
      case 'string':
        return 'string';
      case 'number':
        return Number.isInteger(value) ? 'integer' : 'number';
      case 'boolean':
        return 'boolean';
      default:
        if (value instanceof Date) {
          return 'string';
        }
        if (Array.isArray(value)) {
          return 'array';
        }
        return 'object';
    }
  }

  /**
   * Gets the schema reference name for a DTO class
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static getSchemaName(dtoClass: new (...args: any[]) => any): string {
    return dtoClass.name;
  }
}

