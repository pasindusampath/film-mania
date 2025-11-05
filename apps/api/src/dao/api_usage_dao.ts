import { ApiUsageModel } from '../models';

/**
 * Data Access Object for API Usage operations
 * Handles all database operations for API usage tracking
 */
class ApiUsageDao {
  private static instance: ApiUsageDao;

  private constructor() {}

  public static getInstance(): ApiUsageDao {
    if (!ApiUsageDao.instance) {
      ApiUsageDao.instance = new ApiUsageDao();
    }
    return ApiUsageDao.instance;
  }

  /**
   * Create API usage record
   */
  public async create(data: {
    api_provider: string;
    endpoint: string;
    credits_used: number;
    request_type?: string;
  }): Promise<ApiUsageModel> {
    try {
      return await ApiUsageModel.create(data);
    } catch (error) {
      console.error('Error in ApiUsageDao.create:', error);
      throw error;
    }
  }

  /**
   * Find all usage records for a provider
   */
  public async findByProvider(provider: string): Promise<ApiUsageModel[]> {
    try {
      return await ApiUsageModel.findAll({
        where: { api_provider: provider },
        order: [['created_at', 'DESC']],
      });
    } catch (error) {
      console.error(`Error in ApiUsageDao.findByProvider (${provider}):`, error);
      throw error;
    }
  }

  /**
   * Find all usage records
   */
  public async findAll(options?: {
    limit?: number;
    offset?: number;
  }): Promise<ApiUsageModel[]> {
    try {
      return await ApiUsageModel.findAll({
        limit: options?.limit,
        offset: options?.offset,
        order: [['created_at', 'DESC']],
      });
    } catch (error) {
      console.error('Error in ApiUsageDao.findAll:', error);
      throw error;
    }
  }

  /**
   * Get total credits used for a provider
   */
  public async getTotalCreditsUsed(provider: string): Promise<number> {
    try {
      const records = await this.findByProvider(provider);
      return records.reduce((sum, record) => sum + record.credits_used, 0);
    } catch (error) {
      console.error(`Error in ApiUsageDao.getTotalCreditsUsed (${provider}):`, error);
      throw error;
    }
  }
}

export default ApiUsageDao;

