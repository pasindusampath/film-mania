import { UserModel } from '../models';

/**
 * Data Access Object for User operations
 * Handles all database operations for users
 */
class UserDao {
  private static instance: UserDao;

  private constructor() {}

  public static getInstance(): UserDao {
    if (!UserDao.instance) {
      UserDao.instance = new UserDao();
    }
    return UserDao.instance;
  }

  /**
   * Find user by ID
   */
  public async findById(id: string): Promise<UserModel | null> {
    try {
      return await UserModel.findByPk(id);
    } catch (error) {
      console.error(`Error in UserDao.findById (${id}):`, error);
      throw error;
    }
  }

  /**
   * Find user by email
   */
  public async findByEmail(email: string): Promise<UserModel | null> {
    try {
      return await UserModel.findOne({
        where: { email },
      });
    } catch (error) {
      console.error(`Error in UserDao.findByEmail (${email}):`, error);
      throw error;
    }
  }

  /**
   * Create a new user (personal data only, no auth data)
   */
  public async create(data: {
    email: string;
    first_name?: string;
    last_name?: string;
    subscription_status?: string;
  }): Promise<UserModel> {
    try {
      return await UserModel.create({
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        subscription_status: data.subscription_status || 'inactive',
      });
    } catch (error) {
      console.error('Error in UserDao.create:', error);
      throw error;
    }
  }

  /**
   * Update user subscription status
   */
  public async updateSubscriptionStatus(
    id: string,
    status: string
  ): Promise<UserModel | null> {
    try {
      const user = await UserModel.findByPk(id);
      if (!user) {
        return null;
      }

      await user.update({ subscription_status: status });
      return user;
    } catch (error) {
      console.error(`Error in UserDao.updateSubscriptionStatus (${id}):`, error);
      throw error;
    }
  }

  /**
   * Update user
   */
  public async update(
    id: string,
    data: Partial<{
      email: string;
      first_name: string;
      last_name: string;
      subscription_status: string;
    }>
  ): Promise<UserModel | null> {
    try {
      const user = await UserModel.findByPk(id);
      if (!user) {
        return null;
      }

      await user.update(data);
      return user;
    } catch (error) {
      console.error(`Error in UserDao.update (${id}):`, error);
      throw error;
    }
  }

  /**
   * Delete user
   */
  public async delete(id: string): Promise<boolean> {
    try {
      const user = await UserModel.findByPk(id);
      if (!user) {
        return false;
      }

      await user.destroy();
      return true;
    } catch (error) {
      console.error(`Error in UserDao.delete (${id}):`, error);
      throw error;
    }
  }

  /**
   * Count users
   */
  public async count(): Promise<number> {
    try {
      return await UserModel.count();
    } catch (error) {
      console.error('Error in UserDao.count:', error);
      throw error;
    }
  }
}

export default UserDao;

