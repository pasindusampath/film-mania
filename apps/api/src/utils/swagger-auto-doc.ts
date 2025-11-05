import { RouteDocumentation } from './swagger-route-builder';
import { AutoSwaggerGenerator } from './auto-swagger-generator';
import { DtoToSwaggerConverter } from './dto-to-swagger';

/**
 * Simplified route documentation metadata
 * Just specify what you need, rest is auto-generated
 */
export interface AutoRouteDoc {
  path: string;
  method: 'get' | 'post' | 'put' | 'delete' | 'patch';
  summary: string;
  description?: string;
  tags?: string[];
  // Response DTO class - will be automatically wrapped in IApiResponse
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  responseDto?: new (...args: any[]) => any;
  // Set to true if response is an array
  isArrayResponse?: boolean;
  // Success status code (default: 200, 201 for POST)
  successStatus?: number;
  // Success message
  successMessage?: string;
  // Middleware array (DTOs will be extracted automatically)
  middleware?: unknown[];
}

/**
 * Automatically generates Swagger documentation from route metadata
 * Extracts DTOs from middleware and generates IApiResponse-wrapped responses
 */
export class SwaggerAutoDoc {
  /**
   * Generates complete Swagger documentation from route metadata
   */
  static generate(doc: AutoRouteDoc): RouteDocumentation {
    return AutoSwaggerGenerator.generateFromMetadata(
      {
        path: doc.path,
        method: doc.method,
        summary: doc.summary,
        description: doc.description,
        tags: doc.tags,
        responseDto: doc.responseDto,
        isArrayResponse: doc.isArrayResponse,
        successStatus: doc.successStatus,
        successMessage: doc.successMessage,
      },
      doc.middleware || []
    );
  }

  /**
   * Generates multiple route docs at once
   */
  static generateMany(docs: AutoRouteDoc[]): RouteDocumentation[] {
    return docs.map((doc) => this.generate(doc));
  }

  /**
   * Converts a response DTO class to IApiResponse schema
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static responseDtoToSchema(responseDto: new (...args: any[]) => any, isArray = false): Record<string, unknown> {
    const dtoSchema = DtoToSwaggerConverter.convertToSchema(responseDto);

    const schema: Record<string, unknown> = {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
      },
    };

    if (isArray) {
      schema.properties = {
        ...(schema.properties as Record<string, unknown>),
        data: {
          type: 'array',
          items: dtoSchema,
        },
        count: { type: 'integer', example: 0 },
      };
    } else {
      schema.properties = {
        ...(schema.properties as Record<string, unknown>),
        data: dtoSchema,
      };
    }

    schema.properties = {
      ...(schema.properties as Record<string, unknown>),
      message: { type: 'string' },
    };

    return schema;
  }
}

