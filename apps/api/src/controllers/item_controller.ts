import { Request, Response, NextFunction } from 'express';
import { ItemService } from '../services';
import { CreateItemDto, UpdateItemDto, IdParamDto } from '@nx-mono-repo-deployment-test/shared/src/dtos';

/**
 * Controller for Item endpoints
 * Handles HTTP requests and responses
 * Uses response/error handler middleware for consistent responses
 */
class ItemController {
  private itemService: ItemService;

  constructor(itemService: ItemService) {
    this.itemService = itemService;
  }

  /**
   * GET /api/items
   * Get all items
   */
  getItems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.itemService.getAllItems();

      if (result.success && result.data) {
        res.sendSuccess(result.data, result.message, 200);
      } else {
        res.sendError(result.error || 'Failed to retrieve items', 500);
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/items/:id
   * Get item by ID
   * Note: ID validation is handled by middleware
   */
  getItemById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // ID is already validated and converted by middleware
      const { id } = req.params as unknown as IdParamDto;
      const result = await this.itemService.getItemById(id);

      if (result.success && result.data) {
        res.sendSuccess(result.data, result.message, 200);
      } else {
        res.sendError(result.error || 'Item not found', 404);
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/items
   * Create a new item
   * Note: Body validation is handled by middleware
   */
  createItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Body is already validated and transformed to CreateItemDto by middleware
      const createItemDto = req.body as CreateItemDto;
      const result = await this.itemService.createItem(createItemDto);

      if (result.success && result.data) {
        res.sendSuccess(result.data, result.message || 'Item created successfully', 201);
      } else {
        res.sendError(result.error || 'Failed to create item', 400);
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/items/:id
   * Update an item
   * Note: ID and body validation is handled by middleware
   */
  updateItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // ID and body are already validated by middleware
      const { id } = req.params as unknown as IdParamDto;
      const updateItemDto = req.body as UpdateItemDto;
      const result = await this.itemService.updateItem(id, updateItemDto);

      if (result.success && result.data) {
        res.sendSuccess(result.data, result.message || 'Item updated successfully', 200);
      } else {
        res.sendError(result.error || 'Item not found', 404);
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/items/:id
   * Delete an item
   * Note: ID validation is handled by middleware
   */
  deleteItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // ID is already validated and converted by middleware
      const { id } = req.params as unknown as IdParamDto;
      const result = await this.itemService.deleteItem(id);

      if (result.success) {
        res.sendSuccess(null, result.message || 'Item deleted successfully', 200);
      } else {
        res.sendError(result.error || 'Item not found', 404);
      }
    } catch (error) {
      next(error);
    }
  }
}

export default ItemController;
