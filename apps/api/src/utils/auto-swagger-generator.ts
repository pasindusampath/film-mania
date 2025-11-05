import { BaseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/common/base_dto';
import { IValidatableConstructor } from '@nx-mono-repo-deployment-test/shared/src/interfaces';
import { RouteDocumentation } from './swagger-route-builder';
import { DtoToSwaggerConverter } from './dto-to-swagger';

/**
 * Route metadata for automatic documentation generation
 */
export interface RouteMetadata {
  path: string;
  method: 'get' | 'post' | 'put' | 'delete' | 'patch';
  summary: string;
  description?: string;
  tags?: string[];
  // Response DTO class - will be wrapped in IApiResponse automatically
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  responseDto?: new (...args: any[]) => any;
  // For array responses, specify if it's an array
  isArrayResponse?: boolean;
  // Success status code (default: 200, 201 for POST)
  successStatus?: number;
  // Success message
  successMessage?: string;
}

/**
 * Automatically generates Swagger documentation from route metadata
 */
export class AutoSwaggerGenerator {
  /**
   * Generates route documentation from metadata
   * Automatically extracts DTOs from route middleware and generates responses
   */
  static generateFromMetadata(
    metadata: RouteMetadata,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    routeMiddleware: any[] = []
  ): RouteDocumentation {
    // Extract DTOs from middleware
    const bodyDto = this.extractBodyDto(routeMiddleware);
    const paramDto = this.extractParamDto(routeMiddleware);
    const queryDto = this.extractQueryDto(routeMiddleware);

    // Build base path
    const fullPath = metadata.path;

    // Generate response schemas
    const responses = this.generateResponses(
      metadata.responseDto,
      metadata.isArrayResponse,
      metadata.successStatus || (metadata.method === 'post' ? 201 : 200),
      metadata.successMessage
    );

    return {
      path: fullPath,
      method: metadata.method,
      summary: metadata.summary,
      description: metadata.description,
      tags: metadata.tags,
      requestBody: bodyDto
        ? {
            dto: bodyDto,
            required: true,
          }
        : undefined,
      parameters: [
        ...(paramDto
          ? [
              {
                dto: paramDto,
                in: 'path' as const,
              },
            ]
          : []),
        ...(queryDto
          ? [
              {
                dto: queryDto,
                in: 'query' as const,
              },
            ]
          : []),
      ],
      responses,
    };
  }

  /**
   * Extracts body DTO from middleware array
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static extractBodyDto(middleware: any[]): IValidatableConstructor<BaseDto> | undefined {
    for (const mw of middleware) {
      if (mw && typeof mw === 'function' && mw.dtoClass && mw.source === 'body') {
        return mw.dtoClass;
      }
    }
    return undefined;
  }

  /**
   * Extracts param DTO from middleware array
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static extractParamDto(middleware: any[]): IValidatableConstructor<BaseDto> | undefined {
    for (const mw of middleware) {
      if (mw && typeof mw === 'function' && mw.dtoClass && mw.source === 'params') {
        return mw.dtoClass;
      }
    }
    return undefined;
  }

  /**
   * Extracts query DTO from middleware array
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static extractQueryDto(middleware: any[]): IValidatableConstructor<BaseDto> | undefined {
    for (const mw of middleware) {
      if (mw && typeof mw === 'function' && mw.dtoClass && mw.source === 'query') {
        return mw.dtoClass;
      }
    }
    return undefined;
  }

  /**
   * Generates response schemas wrapped in IApiResponse
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static generateResponses(responseDto?: new (...args: any[]) => any, isArray = false, successStatus = 200, successMessage?: string): RouteDocumentation['responses'] {
    const responses: RouteDocumentation['responses'] = [];

    // Success response
    const successSchema = this.buildApiResponseSchema(responseDto, isArray);
    responses.push({
      status: successStatus,
      description: successMessage || 'Success',
      schema: successSchema,
    });

    // Error responses (always included)
    responses.push({
      status: 400,
      description: 'Bad Request',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: { type: 'string' },
          details: { type: 'object' },
        },
      },
    });

    responses.push({
      status: 500,
      description: 'Internal Server Error',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: { type: 'string' },
        },
      },
    });

    return responses;
  }

  /**
   * Builds IApiResponse schema wrapping a response DTO
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static buildApiResponseSchema(responseDto?: new (...args: any[]) => any, isArray = false): Record<string, unknown> {
    const properties: Record<string, unknown> = {
      success: { type: 'boolean', example: true },
    };

    if (responseDto) {
      // Convert DTO to schema
      const dtoSchema = DtoToSwaggerConverter.convertToSchema(responseDto);

      if (isArray) {
        properties.data = {
          type: 'array',
          items: dtoSchema,
        };
        properties.count = { type: 'integer', example: 0 };
      } else {
        properties.data = dtoSchema;
      }
    } else {
      // No response DTO - use generic object
      if (isArray) {
        properties.data = { type: 'array', items: { type: 'object' } };
        properties.count = { type: 'integer' };
      } else {
        properties.data = { type: 'object' };
      }
    }

    // Add optional message field
    properties.message = { type: 'string' };

    return {
      type: 'object',
      properties,
    };
  }
}

