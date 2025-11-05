import { BaseRouter } from '../common/base_router';
import { ItemController } from '../../controllers';
import { ItemService } from '../../services';
import { ValidationMiddleware } from '../../middleware';
import { CreateItemDto, UpdateItemDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/item/request';
import { IdParamDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/params';
import { RouteDocumentation } from '../../utils/swagger-route-builder';

// Route path constants
const ITEM_BASE_PATH = '/items'; // Full path: /api/items (api prefix added by RouterManager)

/**
 * Class-based router for Item endpoints
 * Handles all item-related routes with proper validation and controller binding
 * 
 * Routes:
 * - GET    /api/items     - Get all items
 * - GET    /api/items/:id - Get item by ID
 * - POST   /api/items     - Create new item
 * - PUT    /api/items/:id - Update item
 * - DELETE /api/items/:id - Delete item
 */
export class ItemRouter extends BaseRouter {
  private itemController!: ItemController;

  constructor() {
    // Call parent constructor first (this will call initializeRoutes)
    super();
  }

  /**
   * Get or create the item controller instance (lazy initialization)
   */
  private getItemController(): ItemController {
    if (!this.itemController) {
      const itemService = ItemService.getInstance();
      this.itemController = new ItemController(itemService);
    }
    return this.itemController;
  }

  /**
   * Initialize all item routes
   * Called automatically by parent constructor
   */
  protected initializeRoutes(): void {
    const controller = this.getItemController();

    // GET /api/items - Get all items
    this.router.get(
      '/',
      controller.getItems
    );

    // GET /api/items/:id - Get item by ID
    this.router.get(
      '/:id',
      ValidationMiddleware.params(IdParamDto),
      controller.getItemById
    );

    // POST /api/items - Create new item
    this.router.post(
      '/',
      ValidationMiddleware.body(CreateItemDto),
      controller.createItem
    );

    // PUT /api/items/:id - Update item
    this.router.put(
      '/:id',
      ...ValidationMiddleware.bodyAndParams(UpdateItemDto, IdParamDto),
      controller.updateItem
    );

    // DELETE /api/items/:id - Delete item
    this.router.delete(
      '/:id',
      ValidationMiddleware.params(IdParamDto),
      controller.deleteItem
    );

    // Register Swagger documentation
    this.registerSwaggerDocs(this.getSwaggerDocs());
  }

  /**
   * Get Swagger documentation for all item routes
   * @returns Array of route documentation objects
   */
  private getSwaggerDocs(): RouteDocumentation[] {
    // Use buildSwaggerPath with useApiPrefix=false since registerSwaggerDocs will add it
    const basePath = this.buildSwaggerPath('/', false);
    
    return [
      {
        path: basePath,
        method: 'get',
        summary: 'Get all items',
        description: 'Retrieve a list of all items',
        tags: ['Items'],
        responses: [
          {
            status: 200,
            description: 'List of items retrieved successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                data: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'integer', example: 1 },
                      name: { type: 'string', example: 'Item Name' },
                      description: { type: 'string', example: 'Item description' },
                      createdAt: { type: 'string', format: 'date-time' },
                      updatedAt: { type: 'string', format: 'date-time' },
                    },
                  },
                },
                count: { type: 'integer', example: 10 },
              },
            },
          },
        ],
      },
      {
        path: this.buildSwaggerPath('/:id', false),
        method: 'get',
        summary: 'Get item by ID',
        description: 'Retrieve a specific item by its ID',
        tags: ['Items'],
        parameters: [
          {
            dto: IdParamDto,
            in: 'path',
            description: 'Item ID (must be a positive integer)',
          },
        ],
        responses: [
          {
            status: 200,
            description: 'Item retrieved successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                data: {
                  type: 'object',
                  properties: {
                    id: { type: 'integer', example: 1 },
                    name: { type: 'string', example: 'Item Name' },
                    description: { type: 'string', example: 'Item description' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
          {
            status: 404,
            description: 'Item not found',
          },
        ],
      },
      {
        path: basePath,
        method: 'post',
        summary: 'Create a new item',
        description: 'Create a new item with the provided details',
        tags: ['Items'],
        requestBody: {
          dto: CreateItemDto,
          description: 'Item creation data',
          required: true,
        },
        responses: [
          {
            status: 201,
            description: 'Item created successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                data: {
                  type: 'object',
                  properties: {
                    id: { type: 'integer', example: 1 },
                    name: { type: 'string', example: 'Item Name' },
                    description: { type: 'string', example: 'Item description' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                  },
                },
                message: { type: 'string', example: 'Item created successfully' },
              },
            },
          },
          {
            status: 400,
            description: 'Validation error',
          },
        ],
      },
      {
        path: this.buildSwaggerPath('/:id', false),
        method: 'put',
        summary: 'Update an item',
        description: 'Update an existing item by ID',
        tags: ['Items'],
        parameters: [
          {
            dto: IdParamDto,
            in: 'path',
            description: 'Item ID (must be a positive integer)',
          },
        ],
        requestBody: {
          dto: UpdateItemDto,
          description: 'Item update data (all fields are optional)',
          required: true,
        },
        responses: [
          {
            status: 200,
            description: 'Item updated successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                data: {
                  type: 'object',
                  properties: {
                    id: { type: 'integer', example: 1 },
                    name: { type: 'string', example: 'Updated Item Name' },
                    description: { type: 'string', example: 'Updated description' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                  },
                },
                message: { type: 'string', example: 'Item updated successfully' },
              },
            },
          },
          {
            status: 404,
            description: 'Item not found',
          },
          {
            status: 400,
            description: 'Validation error',
          },
        ],
      },
      {
        path: this.buildSwaggerPath('/:id', false),
        method: 'delete',
        summary: 'Delete an item',
        description: 'Delete an item by ID',
        tags: ['Items'],
        parameters: [
          {
            dto: IdParamDto,
            in: 'path',
            description: 'Item ID (must be a positive integer)',
          },
        ],
        responses: [
          {
            status: 200,
            description: 'Item deleted successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                data: { type: 'null' },
                message: { type: 'string', example: 'Item deleted successfully' },
              },
            },
          },
          {
            status: 404,
            description: 'Item not found',
          },
        ],
      },
    ];
  }

  /**
   * Get the base path for this router
   * @returns The base path for item routes
   */
  public getBasePath(): string {
    return ITEM_BASE_PATH;
  }

  /**
   * Get route information for this router
   * @returns Array of route information with full paths
   */
  public getRouteInfo(): Array<{ path: string; methods: string[] }> {
    // Note: Full paths will be /api/items and /api/items/:id (api prefix added by RouterManager)
    return [
      { path: ITEM_BASE_PATH, methods: ['GET', 'POST'] },
      { path: `${ITEM_BASE_PATH}/:id`, methods: ['GET', 'PUT', 'DELETE'] }
    ];
  }

  /**
   * Get the item controller instance
   * Useful for testing or accessing controller methods directly
   */
  public getController(): ItemController {
    return this.getItemController();
  }
}
