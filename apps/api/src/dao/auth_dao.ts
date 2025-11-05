import { AuthModel, UserModel } from '../models';
import { IAuth, UserRole } from '@nx-mono-repo-deployment-test/shared';

/**
 * Data Access Object for Auth operations
 * Handles all database operations for authentication and authorization
 */
class AuthDao {
  private static instance: AuthDao;

  private constructor() {}

  public static getInstance(): AuthDao {
    if (!AuthDao.instance) {
      AuthDao.instance = new AuthDao();
    }
    return AuthDao.instance;
  }

  /**
   * Find auth record by user ID
   */
  public async findByUserId(userId: string): Promise<IAuth | null> {
    try {
      const auth = await AuthModel.findOne({
        where: { user_id: userId },
        include: [
          {
            model: UserModel,
            as: 'user',
            attributes: ['id', 'email', 'first_name', 'last_name'],
          },
        ],
      });
      return auth ? this.mapToInterface(auth) : null;
    } catch (error) {
      console.error(`Error in AuthDao.findByUserId (${userId}):`, error);
      throw error;
    }
  }

  /**
   * Find auth record by user email (via user association)
   */
  public async findByUserEmail(email: string): Promise<IAuth | null> {
    try {
      const user = await UserModel.findOne({
        where: { email },
      });

      if (!user) {
        return null;
      }

      const auth = await AuthModel.findOne({
        where: { user_id: user.id },
        include: [
          {
            model: UserModel,
            as: 'user',
            attributes: ['id', 'email', 'first_name', 'last_name'],
          },
        ],
      });
      return auth ? this.mapToInterface(auth) : null;
    } catch (error) {
      console.error(`Error in AuthDao.findByUserEmail (${email}):`, error);
      throw error;
    }
  }

  /**
   * Find auth record by ID
   */
  public async findById(id: string): Promise<IAuth | null> {
    try {
      const auth = await AuthModel.findByPk(id, {
        include: [
          {
            model: UserModel,
            as: 'user',
            attributes: ['id', 'email', 'first_name', 'last_name'],
          },
        ],
      });
      return auth ? this.mapToInterface(auth) : null;
    } catch (error) {
      console.error(`Error in AuthDao.findById (${id}):`, error);
      throw error;
    }
  }

  /**
   * Create a new auth record
   */
  public async create(data: {
    user_id: string;
    password_hash: string;
    role?: UserRole;
    is_active?: boolean;
  }): Promise<IAuth> {
    try {
      const auth = await AuthModel.create({
        user_id: data.user_id,
        password_hash: data.password_hash,
        role: data.role || UserRole.USER,
        is_active: data.is_active !== undefined ? data.is_active : true,
      });

      // Fetch with user association
      const authWithUser = await AuthModel.findByPk(auth.id, {
        include: [
          {
            model: UserModel,
            as: 'user',
            attributes: ['id', 'email', 'first_name', 'last_name'],
          },
        ],
      });

      return this.mapToInterface(authWithUser!);
    } catch (error) {
      console.error('Error in AuthDao.create:', error);
      throw error;
    }
  }

  /**
   * Update auth record
   */
  public async update(
    id: string,
    data: Partial<{
      password_hash: string;
      role: UserRole;
      is_active: boolean;
      last_login: Date;
    }>
  ): Promise<IAuth | null> {
    try {
      const auth = await AuthModel.findByPk(id);
      if (!auth) {
        return null;
      }

      await auth.update(data);

      // Fetch with user association
      const authWithUser = await AuthModel.findByPk(id, {
        include: [
          {
            model: UserModel,
            as: 'user',
            attributes: ['id', 'email', 'first_name', 'last_name'],
          },
        ],
      });

      return this.mapToInterface(authWithUser!);
    } catch (error) {
      console.error(`Error in AuthDao.update (${id}):`, error);
      throw error;
    }
  }

  /**
   * Update auth by user ID
   */
  public async updateByUserId(
    userId: string,
    data: Partial<{
      password_hash: string;
      role: UserRole;
      is_active: boolean;
      last_login: Date;
    }>
  ): Promise<IAuth | null> {
    try {
      const auth = await AuthModel.findOne({
        where: { user_id: userId },
      });

      if (!auth) {
        return null;
      }

      await auth.update(data);

      // Fetch with user association
      const authWithUser = await AuthModel.findOne({
        where: { user_id: userId },
        include: [
          {
            model: UserModel,
            as: 'user',
            attributes: ['id', 'email', 'first_name', 'last_name'],
          },
        ],
      });

      return authWithUser ? this.mapToInterface(authWithUser) : null;
    } catch (error) {
      console.error(`Error in AuthDao.updateByUserId (${userId}):`, error);
      throw error;
    }
  }

  /**
   * Delete auth record
   */
  public async delete(id: string): Promise<boolean> {
    try {
      const auth = await AuthModel.findByPk(id);
      if (!auth) {
        return false;
      }

      await auth.destroy();
      return true;
    } catch (error) {
      console.error(`Error in AuthDao.delete (${id}):`, error);
      throw error;
    }
  }

  /**
   * Map Sequelize model to interface
   */
  private mapToInterface(model: AuthModel): IAuth {
    const auth: IAuth = {
      id: model.id,
      user_id: model.user_id,
      password_hash: model.password_hash,
      role: model.role as UserRole,
      is_active: model.is_active,
      last_login: model.last_login,
      created_at: model.created_at,
      updated_at: model.updated_at,
    };

    // Include user association if present
    if (model.user) {
      auth.user = {
        id: model.user.id,
        email: model.user.email,
        first_name: model.user.first_name,
        last_name: model.user.last_name,
      };
    }

    return auth;
  }
}

export default AuthDao;

