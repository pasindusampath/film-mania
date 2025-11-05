import { AdminFundingModel } from '../models';
import { IAdminFunding, AdminFundingStatus } from '@nx-mono-repo-deployment-test/shared';

/**
 * Data Access Object for Admin Funding operations
 * Handles all database operations for admin funding
 */
class AdminDao {
  private static instance: AdminDao;

  private constructor() {}

  public static getInstance(): AdminDao {
    if (!AdminDao.instance) {
      AdminDao.instance = new AdminDao();
    }
    return AdminDao.instance;
  }

  /**
   * Create a new funding record
   */
  public async createFunding(data: {
    user_id: string;
    amount: number;
    months_funded: number;
    start_date: Date;
    end_date: Date;
    status: AdminFundingStatus;
    created_by?: string;
  }): Promise<IAdminFunding> {
    try {
      const fundingModel = await AdminFundingModel.create(data);
      return this.mapToInterface(fundingModel);
    } catch (error) {
      console.error('Error in AdminDao.createFunding:', error);
      throw error;
    }
  }

  /**
   * Find all active fundings
   */
  public async findActiveFundings(): Promise<IAdminFunding[]> {
    try {
      const fundingModels = await AdminFundingModel.findAll({
        where: { status: 'active' },
      });
      return fundingModels.map((model) => this.mapToInterface(model));
    } catch (error) {
      console.error('Error in AdminDao.findActiveFundings:', error);
      throw error;
    }
  }

  /**
   * Find all funded users with user details
   */
  public async findFundedUsersWithDetails(): Promise<IAdminFunding[]> {
    try {
      const { UserModel } = await import('../models');
      const fundingModels = await AdminFundingModel.findAll({
        where: { status: 'active' },
        include: [
          {
            model: UserModel,
            as: 'user',
            attributes: ['id', 'email', 'first_name', 'last_name'],
          },
        ],
        order: [['created_at', 'DESC']],
      });

      return fundingModels.map((model) => {
        const funding = this.mapToInterface(model);
        
        // Include user association if present
        if (model.user) {
          funding.user = {
            id: model.user.id,
            email: model.user.email,
            first_name: model.user.first_name,
            last_name: model.user.last_name,
          };
        }

        return funding;
      });
    } catch (error) {
      console.error('Error in AdminDao.findFundedUsersWithDetails:', error);
      throw error;
    }
  }

  /**
   * Find funding by user ID
   */
  public async findByUserId(userId: string): Promise<IAdminFunding | null> {
    try {
      const fundingModel = await AdminFundingModel.findOne({
        where: { user_id: userId, status: 'active' },
        order: [['created_at', 'DESC']],
      });
      return fundingModel ? this.mapToInterface(fundingModel) : null;
    } catch (error) {
      console.error(`Error in AdminDao.findByUserId (${userId}):`, error);
      throw error;
    }
  }

  /**
   * Update funding status
   */
  public async updateStatus(
    id: string,
    status: AdminFundingStatus
  ): Promise<IAdminFunding | null> {
    try {
      const fundingModel = await AdminFundingModel.findByPk(id);
      if (!fundingModel) {
        return null;
      }
      
      await fundingModel.update({ status });
      return this.mapToInterface(fundingModel);
    } catch (error) {
      console.error(`Error in AdminDao.updateStatus (${id}):`, error);
      throw error;
    }
  }

  /**
   * Map Sequelize model to interface
   */
  private mapToInterface(model: AdminFundingModel): IAdminFunding {
    return {
      id: model.id,
      user_id: model.user_id,
      amount: Number(model.amount),
      months_funded: model.months_funded,
      start_date: model.start_date,
      end_date: model.end_date,
      status: model.status as AdminFundingStatus,
      created_by: model.created_by,
      created_at: model.created_at,
      updated_at: model.updated_at,
    };
  }
}

export default AdminDao;

