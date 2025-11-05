import { ApiCreditModel } from '../models';
import { IApiCredit } from '@nx-mono-repo-deployment-test/shared/src/interfaces';

/**
 * Data Access Object for API Credit operations
 * Handles all database operations for API credits
 */
class ApiCreditDao {
  private static instance: ApiCreditDao;

  private constructor() {}

  public static getInstance(): ApiCreditDao {
    if (!ApiCreditDao.instance) {
      ApiCreditDao.instance = new ApiCreditDao();
    }
    return ApiCreditDao.instance;
  }

  /**
   * Find all API credits
   */
  public async findAll(): Promise<IApiCredit[]> {
    try {
      const credits = await ApiCreditModel.findAll({
        order: [['purchase_date', 'DESC']],
      });
      return credits.map((credit) => this.mapToInterface(credit));
    } catch (error) {
      console.error('Error in ApiCreditDao.findAll:', error);
      throw error;
    }
  }

  /**
   * Find API credit by provider
   */
  public async findByProvider(provider: string): Promise<IApiCredit | null> {
    try {
      const credit = await ApiCreditModel.findOne({
        where: { api_provider: provider },
        order: [['purchase_date', 'DESC']],
      });
      return credit ? this.mapToInterface(credit) : null;
    } catch (error) {
      console.error(`Error in ApiCreditDao.findByProvider (${provider}):`, error);
      throw error;
    }
  }

  /**
   * Find API credit by ID
   */
  public async findById(id: string): Promise<IApiCredit | null> {
    try {
      const credit = await ApiCreditModel.findByPk(id);
      return credit ? this.mapToInterface(credit) : null;
    } catch (error) {
      console.error(`Error in ApiCreditDao.findById (${id}):`, error);
      throw error;
    }
  }

  /**
   * Create new API credit
   */
  public async create(data: {
    api_provider: string;
    credits_purchased: number;
    credits_used: number;
    cost?: number | null;
    purchase_date: Date;
    expiry_date?: Date | null;
  }): Promise<IApiCredit> {
    try {
      const credit = await ApiCreditModel.create(data);
      return this.mapToInterface(credit);
    } catch (error) {
      console.error('Error in ApiCreditDao.create:', error);
      throw error;
    }
  }

  /**
   * Increment credits used
   */
  public async incrementCreditsUsed(id: string, amount: number = 1): Promise<IApiCredit | null> {
    try {
      const credit = await ApiCreditModel.findByPk(id);
      if (!credit) {
        return null;
      }

      await credit.increment('credits_used', { by: amount });
      await credit.reload();
      return this.mapToInterface(credit);
    } catch (error) {
      console.error(`Error in ApiCreditDao.incrementCreditsUsed (${id}):`, error);
      throw error;
    }
  }

  /**
   * Update API credit
   */
  public async update(
    id: string,
    data: Partial<{
      credits_purchased: number;
      credits_used: number;
      cost: number | null;
      expiry_date: Date | null;
    }>
  ): Promise<IApiCredit | null> {
    try {
      const credit = await ApiCreditModel.findByPk(id);
      if (!credit) {
        return null;
      }

      await credit.update(data);
      return this.mapToInterface(credit);
    } catch (error) {
      console.error(`Error in ApiCreditDao.update (${id}):`, error);
      throw error;
    }
  }

  /**
   * Delete API credit
   */
  public async delete(id: string): Promise<boolean> {
    try {
      const credit = await ApiCreditModel.findByPk(id);
      if (!credit) {
        return false;
      }

      await credit.destroy();
      return true;
    } catch (error) {
      console.error(`Error in ApiCreditDao.delete (${id}):`, error);
      throw error;
    }
  }

  /**
   * Map Sequelize model to interface
   */
  private mapToInterface(model: ApiCreditModel): IApiCredit {
    return {
      id: model.id,
      api_provider: model.api_provider,
      credits_purchased: model.credits_purchased,
      credits_used: model.credits_used,
      purchase_date: model.purchase_date,
      expiry_date: model.expiry_date,
      cost: model.cost ? Number(model.cost) : undefined,
      created_at: model.created_at,
      updated_at: model.updated_at,
    };
  }
}

export default ApiCreditDao;

