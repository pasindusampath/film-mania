import { ItemDao } from '../dao';
import { CreateItemDto, UpdateItemDto,ItemResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/item';
import { IApiResponse } from '@nx-mono-repo-deployment-test/shared/src/interfaces';

/**
 * Service layer for Item business logic
 * Handles validation and business rules
 */
class ItemService {
  private static instance: ItemService;
  private itemDao: ItemDao;

  private constructor(itemDao: ItemDao) {
    this.itemDao = itemDao;
  }

  /**
   * Get ItemService singleton instance
   */
  public static getInstance(): ItemService {
    if (!ItemService.instance) {
      ItemService.instance = new ItemService(ItemDao.getInstance());
    }
    return ItemService.instance;
  }

  /**
   * Get all items
   */
  public async getAllItems(): Promise<IApiResponse<ItemResponseDto[]>> {
    try {
      const items = await this.itemDao.findAll();
      const itemDtos = items.map(item => new ItemResponseDto(item));

      return {
        success: true,
        data: itemDtos,
        count: itemDtos.length,
      };
    } catch (error) {
      console.error('Error in ItemService.getAllItems:', error);
      return {
        success: false,
        error: 'Failed to retrieve items',
      };
    }
  }

  /**
   * Get item by ID
   */
  public async getItemById(id: number): Promise<IApiResponse<ItemResponseDto>> {
    try {
      const item = await this.itemDao.findById(id);

      if (!item) {
        return {
          success: false,
          error: 'Item not found',
        };
      }

      return {
        success: true,
        data: new ItemResponseDto(item),
      };
    } catch (error) {
      console.error(`Error in ItemService.getItemById (${id}):`, error);
      return {
        success: false,
        error: 'Failed to retrieve item',
      };
    }
  }

  /**
   * Create a new item
   */
  public async createItem(createItemDto: CreateItemDto): Promise<IApiResponse<ItemResponseDto>> {
    try {
      // Validate input
      if (!createItemDto.name || createItemDto.name.trim() === '') {
        return {
          success: false,
          error: 'Item name is required',
        };
      }

      // Business logic: Trim whitespace
      const trimmedDto = new CreateItemDto({
        name: createItemDto.name.trim(),
        description: createItemDto.description?.trim()
      });

      const item = await this.itemDao.create(trimmedDto);

      return {
        success: true,
        data: new ItemResponseDto(item),
        message: 'Item created successfully',
      };
    } catch (error) {
      console.error('Error in ItemService.createItem:', error);
      return {
        success: false,
        error: 'Failed to create item',
      };
    }
  }

  /**
   * Update an item
   */
  public async updateItem(id: number, updateItemDto: UpdateItemDto): Promise<IApiResponse<ItemResponseDto>> {
    try {
      // Validate input
      if (updateItemDto.name !== undefined && updateItemDto.name.trim() === '') {
        return {
          success: false,
          error: 'Item name cannot be empty',
        };
      }

      // Business logic: Trim whitespace if provided
      const trimmedDto = new UpdateItemDto({
        name: updateItemDto.name?.trim(),
        description: updateItemDto.description?.trim(),
      });

      const item = await this.itemDao.update(id, trimmedDto);

      if (!item) {
        return {
          success: false,
          error: 'Item not found',
        };
      }

      return {
        success: true,
        data: new ItemResponseDto(item),
        message: 'Item updated successfully',
      };
    } catch (error) {
      console.error(`Error in ItemService.updateItem (${id}):`, error);
      return {
        success: false,
        error: 'Failed to update item',
      };
    }
  }

  /**
   * Delete an item
   */
  public async deleteItem(id: number): Promise<IApiResponse<null>> {
    try {
      const deleted = await this.itemDao.delete(id);

      if (!deleted) {
        return {
          success: false,
          error: 'Item not found',
        };
      }

      return {
        success: true,
        message: 'Item deleted successfully',
      };
    } catch (error) {
      console.error(`Error in ItemService.deleteItem (${id}):`, error);
      return {
        success: false,
        error: 'Failed to delete item',
      };
    }
  }
}

export default ItemService;

