import { IUser } from '../../../interfaces/auth';
import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * User response DTO
 * Used for get current user endpoint
 */
export class UserResponseDto {
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

  @IsOptional()
  @Type(() => Date)
  created_at?: Date;

  constructor(user: IUser) {
    this.id = user.id;
    this.email = user.email;
    this.first_name = user.first_name;
    this.last_name = user.last_name;
    this.subscription_status = user.subscription_status;
    this.created_at = user.created_at;
  }
}

