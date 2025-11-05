import * as bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { UserModel } from '../models';
import { appConfig } from '../config/app.config';

export interface RegisterData {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Authentication Service
 * Handles user registration, login, and token generation
 */
class AuthService {
  private readonly SALT_ROUNDS = 10;

  constructor() {
    // Configuration loaded from centralized app.config
  }

  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<UserModel> {
    // Check if user already exists
    const existingUser = await UserModel.findOne({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, this.SALT_ROUNDS);

    // Create user
    const user = await UserModel.create({
      email: data.email,
      password_hash: passwordHash,
      first_name: data.first_name,
      last_name: data.last_name,
      subscription_status: 'inactive',
      is_admin: false,
      is_active: true,
    });

    return user;
  }

  /**
   * Login user and generate tokens
   */
  async login(data: LoginData): Promise<{ user: UserModel; tokens: AuthTokens }> {
    // Find user
    const user = await UserModel.findOne({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (!user.is_active) {
      throw new Error('Account is inactive');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(data.password, user.password_hash);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    user.last_login = new Date();
    await user.save();

    // Generate tokens
    const tokens = this.generateTokens(user.id, user.email);

    return { user, tokens };
  }

  /**
   * Generate access and refresh tokens
   */
  generateTokens(userId: string, email: string): AuthTokens {
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
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const decoded = jwt.verify(refreshToken, appConfig.jwt.refreshSecret) as {
        id: string;
        email: string;
      };

      // Verify user still exists and is active
      const user = await UserModel.findByPk(decoded.id);

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
    const user = await UserModel.findByPk(userId);
    if (!user) {
      return false;
    }

    return bcrypt.compare(password, user.password_hash);
  }
}

export default new AuthService();

