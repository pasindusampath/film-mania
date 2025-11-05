import * as bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { UserDao } from '../dao';
import { IRegisterData, ILoginData, IAuthTokens, IUser, IApiResponse } from '@nx-mono-repo-deployment-test/shared';
import { appConfig } from '../config/app.config';

/**
 * Authentication Service
 * Handles user registration, login, and token generation
 */
class AuthService {
  private readonly SALT_ROUNDS = 10;
  private userDao: UserDao;

  constructor() {
    // Configuration loaded from centralized app.config
    this.userDao = UserDao.getInstance();
  }

  /**
   * Register a new user
   */
  async register(data: IRegisterData): Promise<IApiResponse<IUser>> {
    try {
      // Check if user already exists
      const existingUser = await this.userDao.findByEmail(data.email);

      if (existingUser) {
        return {
          success: false,
          error: 'User with this email already exists',
        };
      }

      // Hash password
      const passwordHash = await bcrypt.hash(data.password, this.SALT_ROUNDS);

      // Create user
      const userModel = await this.userDao.create({
        email: data.email,
        password: passwordHash,
        first_name: data.first_name,
        last_name: data.last_name,
        subscription_status: 'inactive',
      });

      // Convert model to plain interface object
      const user: IUser = {
        id: userModel.id,
        email: userModel.email,
        first_name: userModel.first_name,
        last_name: userModel.last_name,
        subscription_status: userModel.subscription_status,
        is_admin: userModel.is_admin,
        is_active: userModel.is_active,
        last_login: userModel.last_login,
        created_at: userModel.created_at,
        updated_at: userModel.updated_at,
      };

      return {
        success: true,
        data: user,
        message: 'User registered successfully',
      };
    } catch (error) {
      console.error('Error in AuthService.register:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to register user',
      };
    }
  }

  /**
   * Login user and generate tokens
   */
  async login(data: ILoginData): Promise<IApiResponse<{ user: IUser; tokens: IAuthTokens }>> {
    try {
      // Find user
      const userModel = await this.userDao.findByEmail(data.email);

      if (!userModel) {
        return {
          success: false,
          error: 'Invalid email or password',
        };
      }

      if (!userModel.is_active) {
        return {
          success: false,
          error: 'Account is inactive',
        };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(data.password, userModel.password_hash);

      if (!isPasswordValid) {
        return {
          success: false,
          error: 'Invalid email or password',
        };
      }

      // Update last login
      userModel.last_login = new Date();
      await userModel.save();

      // Generate tokens
      const tokens = this.generateTokens(userModel.id, userModel.email);

      // Convert model to plain interface object
      const user: IUser = {
        id: userModel.id,
        email: userModel.email,
        first_name: userModel.first_name,
        last_name: userModel.last_name,
        subscription_status: userModel.subscription_status,
        is_admin: userModel.is_admin,
        is_active: userModel.is_active,
        last_login: userModel.last_login,
        created_at: userModel.created_at,
        updated_at: userModel.updated_at,
      };

      return {
        success: true,
        data: { user, tokens },
        message: 'Login successful',
      };
    } catch (error) {
      console.error('Error in AuthService.login:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      };
    }
  }

  /**
   * Generate access and refresh tokens
   */
  generateTokens(userId: string, email: string): IAuthTokens {
    const payload = { id: userId, email };

    const accessTokenOptions: SignOptions = {
      expiresIn: appConfig.jwt.accessTokenExpiry,
    };

    const refreshTokenOptions: SignOptions = {
      expiresIn: appConfig.jwt.refreshTokenExpiry,
    };

    const accessToken = jwt.sign(payload, appConfig.jwt.secret, accessTokenOptions);
    const refreshToken = jwt.sign(payload, appConfig.jwt.refreshSecret, refreshTokenOptions);

    // Calculate expiry in seconds
    const expiresIn = this.parseExpiry(appConfig.jwt.accessTokenExpiry);

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<IAuthTokens> {
    try {
      const decoded = jwt.verify(refreshToken, appConfig.jwt.refreshSecret) as {
        id: string;
        email: string;
      };

      // Verify user still exists and is active
      const user = await this.userDao.findById(decoded.id);

      if (!user || !user.is_active) {
        throw new Error('User not found or inactive');
      }

      // Generate new tokens
      return this.generateTokens(user.id, user.email);
    } catch (error: unknown) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token expired');
      }
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Parse expiry string to seconds
   */
  private parseExpiry(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 86400; // Default to 24 hours
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return 86400;
    }
  }

  /**
   * Verify password
   */
  async verifyPassword(userId: string, password: string): Promise<boolean> {
    const user = await this.userDao.findById(userId);
    if (!user) {
      return false;
    }

    return bcrypt.compare(password, user.password_hash);
  }
}

export default new AuthService();

