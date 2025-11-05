import { BaseRouter } from '../common/base_router';
import { ItemController } from '../../controllers';
import { ItemService } from '../../services';
import { ValidationMiddleware } from '../../middleware';
import { CreateItemDto, UpdateItemDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/item/request';
import { IdParamDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/params';
import { ItemResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/item/response';
import { SwaggerAutoDoc } from '../../utils/swagger-auto-doc';

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

    // Register Swagger documentation - automatically generated from route config
    this.registerSwaggerDocs(this.generateSwaggerDocs());
  }

  /**
   * Automatically generate Swagger documentation from route configuration
   * DTOs are extracted from middleware, responses are auto-wrapped in IApiResponse
   */
  private generateSwaggerDocs() {
    const basePath = this.buildSwaggerPath('/', false);

    return SwaggerAutoDoc.generateMany([
      {
        path: basePath,
        method: 'get',
        summary: 'Get all items',
        description: 'Retrieve a list of all items',
        tags: ['Items'],
        responseDto: ItemResponseDto,
        isArrayResponse: true,
        successStatus: 200,
        middleware: [],
      },
      {
        path: this.buildSwaggerPath('/:id', false),
        method: 'get',
        summary: 'Get item by ID',
        description: 'Retrieve a specific item by its ID',
        tags: ['Items'],
        responseDto: ItemResponseDto,
        successStatus: 200,
        middleware: [ValidationMiddleware.params(IdParamDto)],
      },
      {
        path: basePath,
        method: 'post',
        summary: 'Create a new item',
        description: 'Create a new item with the provided details',
        tags: ['Items'],
        responseDto: ItemResponseDto,
        successStatus: 201,
        successMessage: 'Item created successfully',
        middleware: [ValidationMiddleware.body(CreateItemDto)],
      },
      {
        path: this.buildSwaggerPath('/:id', false),
        method: 'put',
        summary: 'Update an item',
        description: 'Update an existing item by ID',
        tags: ['Items'],
        responseDto: ItemResponseDto,
        successStatus: 200,
        successMessage: 'Item updated successfully',
        middleware: [...ValidationMiddleware.bodyAndParams(UpdateItemDto, IdParamDto)],
      },
      {
        path: this.buildSwaggerPath('/:id', false),
        method: 'delete',
        summary: 'Delete an item',
        description: 'Delete an item by ID',
        tags: ['Items'],
        successStatus: 200,
        successMessage: 'Item deleted successfully',
        middleware: [ValidationMiddleware.params(IdParamDto)],
      },
    ]);
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
