import { BaseRouter } from '../common/base_router';
import { AuthController } from '../../controllers';
import { authenticate } from '../../middleware';
import { ValidationMiddleware } from '../../middleware/validation';
import { 
  RegisterDto, 
  LoginDto, 
  RefreshTokenDto,
  AuthResponseDto,
  TokenResponseDto,
  UserResponseDto
} from '@nx-mono-repo-deployment-test/shared/src/dtos';
import { SwaggerAutoDoc } from '../../utils/swagger-auto-doc';

/**
 * Authentication Router
 * Handles user registration, login, and token refresh
 */
export class AuthRouter extends BaseRouter {
  private authController!: AuthController;

  constructor() {
    super();
  }

  /**
   * Get or create the auth controller instance (lazy initialization)
   */
  private getAuthController(): AuthController {
    if (!this.authController) {
      this.authController = new AuthController();
    }
    return this.authController;
  }

  /**
   * Get base path for auth routes
   */
  public getBasePath(): string {
    return '/auth';
  }

  /**
   * Initialize routes (required by BaseRouter)
   */
  protected initializeRoutes(): void {
    const controller = this.getAuthController();

    // Register new user
    this.router.post(
      '/register',
      ValidationMiddleware.body(RegisterDto),
      controller.register
    );

    // Login user
    this.router.post(
      '/login',
      ValidationMiddleware.body(LoginDto),
      controller.login
    );

    // Refresh token
    this.router.post(
      '/refresh',
      ValidationMiddleware.body(RefreshTokenDto),
      controller.refresh
    );

    // Get current user (protected)
    this.router.get('/me', authenticate, controller.getCurrentUser);

    // Register Swagger documentation
    this.registerSwaggerDocs(this.generateSwaggerDocs());
  }

  /**
   * Automatically generate Swagger documentation from route configuration
   */
  private generateSwaggerDocs() {
    const basePath = this.buildSwaggerPath('/', false);

    return SwaggerAutoDoc.generateMany([
      {
        path: this.buildSwaggerPath('/register', false),
        method: 'post',
        summary: 'Register a new user',
        description: 'Create a new user account with email and password',
        tags: ['Authentication'],
        responseDto: AuthResponseDto,
        successStatus: 201,
        successMessage: 'User registered successfully',
        middleware: [ValidationMiddleware.body(RegisterDto)],
      },
      {
        path: this.buildSwaggerPath('/login', false),
        method: 'post',
        summary: 'Login user',
        description: 'Authenticate user and receive access tokens',
        tags: ['Authentication'],
        responseDto: AuthResponseDto,
        successStatus: 200,
        successMessage: 'Login successful',
        middleware: [ValidationMiddleware.body(LoginDto)],
      },
      {
        path: this.buildSwaggerPath('/refresh', false),
        method: 'post',
        summary: 'Refresh access token',
        description: 'Get a new access token using refresh token',
        tags: ['Authentication'],
        responseDto: TokenResponseDto,
        successStatus: 200,
        successMessage: 'Token refreshed successfully',
        middleware: [ValidationMiddleware.body(RefreshTokenDto)],
      },
      {
        path: this.buildSwaggerPath('/me', false),
        method: 'get',
        summary: 'Get current user',
        description: 'Get the currently authenticated user information',
        tags: ['Authentication'],
        responseDto: UserResponseDto,
        successStatus: 200,
        successMessage: 'User retrieved successfully',
        middleware: [authenticate],
      },
    ]);
  }

  /**
   * Get route information
   */
  public getRouteInfo(): Array<{ path: string; methods: string[] }> {
    return [
      { path: '/register', methods: ['POST'] },
      { path: '/login', methods: ['POST'] },
      { path: '/refresh', methods: ['POST'] },
      { path: '/me', methods: ['GET'] },
    ];
  }

  /**
   * Get the auth controller instance
   * Useful for testing or accessing controller methods directly
   */
  public getController(): AuthController {
    return this.getAuthController();
  }
}

