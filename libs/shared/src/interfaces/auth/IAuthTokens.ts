/**
 * Authentication tokens interface
 * JWT tokens returned after successful authentication
 */
export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

