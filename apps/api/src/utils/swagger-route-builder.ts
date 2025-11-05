import { BaseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/common/base_dto';
import { DtoToSwaggerConverter } from './dto-to-swagger';
import { IValidatableConstructor } from '@nx-mono-repo-deployment-test/shared/src/interfaces';

/**
 * Interface for route documentation configuration
 */
export interface RouteDocumentation {
  path: string;
  method: 'get' | 'post' | 'put' | 'delete' | 'patch';
  summary: string;
  description?: string;
  tags?: string[];
  requestBody?: {
    dto: IValidatableConstructor<BaseDto>;
    description?: string;
    required?: boolean;
  };
  parameters?: {
    dto: IValidatableConstructor<BaseDto>;
    in: 'path' | 'query';
    description?: string;
  }[];
  responses?: {
    status: number;
    description: string;
    schema?: Record<string, unknown>;
  }[];
  security?: Array<{ [key: string]: string[] }>;
}

/**
 * Builds Swagger/OpenAPI documentation from route configuration
 */
export class SwaggerRouteBuilder {
  /**
   * Converts route documentation to Swagger path object
   */
  static buildPath(doc: RouteDocumentation): Record<string, unknown> {
    const pathObj: Record<string, unknown> = {
      [doc.method]: {
        summary: doc.summary,
        ...(doc.description && { description: doc.description }),
        ...(doc.tags && { tags: doc.tags }),
        responses: this.buildResponses(doc),
      },
    };

    // Add request body
    if (doc.requestBody) {
      const schemaName = DtoToSwaggerConverter.getSchemaName(doc.requestBody.dto);
      (pathObj[doc.method] as Record<string, unknown>).requestBody = {
        required: doc.requestBody.required !== false,
        content: {
          'application/json': {
            schema: {
              $ref: `#/components/schemas/${schemaName}`,
            },
            ...(doc.requestBody.description && {
              example: this.getExampleFromDto(doc.requestBody.dto),
            }),
          },
        },
        ...(doc.requestBody.description && { description: doc.requestBody.description }),
      };
    }

    // Add parameters
    if (doc.parameters && doc.parameters.length > 0) {
      (pathObj[doc.method] as Record<string, unknown>).parameters = doc.parameters.map((param) => {
        const schema = DtoToSwaggerConverter.convertToSchema(param.dto);
        const paramObj: Record<string, unknown> = {
          in: param.in,
          required: true,
          schema: schema,
          ...(param.description && { description: param.description }),
        };
        return paramObj;
      });
    }

    // Add security
    if (doc.security) {
      (pathObj[doc.method] as Record<string, unknown>).security = doc.security;
    }

    return pathObj;
  }

  /**
   * Builds response schemas
   */
  private static buildResponses(doc: RouteDocumentation): Record<string, unknown> {
    const responses: Record<string, unknown> = {};

    // Add custom responses
    if (doc.responses && doc.responses.length > 0) {
      doc.responses.forEach((response) => {
        responses[response.status] = {
          description: response.description,
          ...(response.schema && { content: { 'application/json': { schema: response.schema } } }),
        };
      });
    }

    // Add default success response
    if (!responses[200]) {
      responses[200] = {
        description: 'Success',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                data: { type: 'object' },
              },
            },
          },
        },
      };
    }

    // Add default error responses
    if (!responses[400]) {
      responses[400] = {
        description: 'Bad Request',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: false },
                error: { type: 'string' },
                details: { type: 'object' },
              },
            },
          },
        },
      };
    }

    if (!responses[500]) {
      responses[500] = {
        description: 'Internal Server Error',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: false },
                error: { type: 'string' },
              },
            },
          },
        },
      };
    }

    return responses;
  }

  /**
   * Gets example object from DTO class
   */
  private static getExampleFromDto(dtoClass: IValidatableConstructor<BaseDto>): Record<string, unknown> | undefined {
    try {
      const instance = new dtoClass();
      const example: Record<string, unknown> = {};
      
      Object.keys(instance).forEach((key) => {
        const value = (instance as unknown as Record<string, unknown>)[key];
        if (value !== undefined) {
          example[key] = value;
        }
      });

      return Object.keys(example).length > 0 ? example : undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Extracts schema components from DTOs
   */
  static extractSchemas(docs: RouteDocumentation[]): Record<string, unknown> {
    const schemas: Record<string, unknown> = {};
    const processed = new Set<string>();

    docs.forEach((doc) => {
      // Extract request body schema
      if (doc.requestBody) {
        const schemaName = DtoToSwaggerConverter.getSchemaName(doc.requestBody.dto);
        if (!processed.has(schemaName)) {
          schemas[schemaName] = DtoToSwaggerConverter.convertToSchema(doc.requestBody.dto);
          processed.add(schemaName);
        }
      }

      // Extract parameter schemas
      if (doc.parameters) {
        doc.parameters.forEach((param) => {
          const schemaName = DtoToSwaggerConverter.getSchemaName(param.dto);
          if (!processed.has(schemaName)) {
            schemas[schemaName] = DtoToSwaggerConverter.convertToSchema(param.dto);
            processed.add(schemaName);
          }
        });
      }
    });

    return schemas;
  }
}

