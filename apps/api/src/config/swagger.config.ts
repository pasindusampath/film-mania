import { SwaggerDefinition } from 'swagger-jsdoc';
import { appConfig } from './app.config';

/**
 * Swagger/OpenAPI configuration
 */
export const swaggerConfig: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Film Mania API',
    version: '1.0.0',
    description: 'RESTful API documentation for Film Mania application',
    contact: {
      name: 'API Support',
    },
  },
  servers: [
    {
      url: `http://localhost:${appConfig.port}`,
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"',
      },
    },
    schemas: {
      // Base API Response
      ApiResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          data: {
            type: 'object',
          },
          message: {
            type: 'string',
          },
          count: {
            type: 'number',
          },
        },
      },
      // Error Response
      ErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          error: {
            type: 'string',
          },
          details: {
            type: 'object',
          },
        },
      },
    },
  },
  tags: [
    {
      name: 'Items',
      description: 'Item management endpoints',
    },
    {
      name: 'Auth',
      description: 'Authentication endpoints',
    },
    {
      name: 'Movies',
      description: 'Movie catalog endpoints',
    },
    {
      name: 'Subscriptions',
      description: 'Subscription management endpoints',
    },
    {
      name: 'Admin',
      description: 'Admin endpoints',
    },
    {
      name: 'Health',
      description: 'Health check endpoints',
    },
  ],
};

