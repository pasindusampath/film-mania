import { IAuthTokens } from '../../../interfaces/auth';
import { IsString, IsNumber } from 'class-validator';

/**
 * Token response DTO
 * Used for refresh token endpoint
 */
export class TokenResponseDto {
  @IsString()
  accessToken!: string;

  @IsString()
  refreshToken!: string;

  @IsNumber()
  expiresIn!: number;

  constructor(tokens: IAuthTokens) {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    this.expiresIn = tokens.expiresIn;
  }
}

