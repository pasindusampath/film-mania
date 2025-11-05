import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { UserModel } from '../models';

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
  private readonly JWT_SECRET: string;
  private readonly JWT_REFRESH_SECRET: string;
  private readonly ACCESS_TOKEN_EXPIRY: string;
  private readonly REFRESH_TOKEN_EXPIRY: string;
  private readonly SALT_ROUNDS = 10;

  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    this.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production';
    this.ACCESS_TOKEN_EXPIRY = process.env.JWT_EXPIRY || '24h';
    this.REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';
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

    const accessToken = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    });

    const refreshToken = jwt.sign(payload, this.JWT_REFRESH_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRY,
    });

    // Calculate expiry in seconds
    const expiresIn = this.parseExpiry(this.ACCESS_TOKEN_EXPIRY);

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
      const decoded = jwt.verify(refreshToken, this.JWT_REFRESH_SECRET) as {
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
    } catch (error) {
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

