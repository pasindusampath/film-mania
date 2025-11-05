import { IUser, IAuthTokens } from '../../../interfaces/auth';
import { IsString, IsOptional, IsNumber, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * User response DTO (nested in auth response)
 */
class UserResponsePartDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  email!: string;

  @IsOptional()
  @IsString()
  first_name?: string;

  @IsOptional()
  @IsString()
  last_name?: string;

  @IsString()
  subscription_status!: string;
}

/**
 * Authentication response DTO
 * Contains user info and tokens (tokens are spread at the top level)
 */
export class AuthResponseDto {
  @ValidateNested()
  @Type(() => UserResponsePartDto)
  user!: UserResponsePartDto;

  @IsString()
  accessToken!: string;

  @IsString()
  refreshToken!: string;

  @IsNumber()
  expiresIn!: number;

  constructor(data: { user: IUser; tokens: IAuthTokens }) {
    this.user = {
      id: data.user.id,
      email: data.user.email,
      first_name: data.user.first_name,
      last_name: data.user.last_name,
      subscription_status: data.user.subscription_status,
    };
    this.accessToken = data.tokens.accessToken;
    this.refreshToken = data.tokens.refreshToken;
    this.expiresIn = data.tokens.expiresIn;
  }
}

