import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application, RequestHandler ,  } from 'express';
import { swaggerConfig } from '../config/swagger.config';
import { SwaggerDocRegistry } from '../utils/swagger-doc-registry';

/**
 * Setup Swagger documentation middleware
 */
export function setupSwagger(app: Application): void {
  // Get all registered routes and schemas
  const paths = SwaggerDocRegistry.getPaths();
  const schemas = SwaggerDocRegistry.getSchemas();

  // Merge schemas with base config schemas
  const finalSchemas = {
    ...swaggerConfig.components?.schemas,
    ...schemas,
  };

  // Combine base config with dynamic paths and schemas
  const swaggerSpec = swaggerJsdoc({
    definition: {
      ...swaggerConfig,
      paths,
      components: {
        ...swaggerConfig.components,
        schemas: finalSchemas,
      },
    },
    apis: [], // We're building the spec programmatically, so no files needed
  });

  // Serve Swagger UI
  // swaggerUi.serve is an array of RequestHandler[], so we need to spread it
  const swaggerUiSetup = swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Film Mania API Documentation',
    explorer: true,
  });
  
  // Type assertion needed due to conflicting Express type definitions
  // between express and swagger-ui-express dependencies
  // Runtime behavior is correct, this is just a TypeScript type conflict
  const handlers: RequestHandler[] = [
    ...(swaggerUi.serve as unknown as RequestHandler[]),
    swaggerUiSetup as unknown as RequestHandler,
  ];
  app.use('/api-docs', ...handlers);

  // Serve Swagger JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log('✓ Swagger documentation available at /api-docs');
  console.log('✓ Swagger JSON available at /api-docs.json');
}

