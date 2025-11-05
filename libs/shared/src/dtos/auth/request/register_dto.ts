import { IsString, IsNotEmpty, IsOptional, IsEmail, MinLength } from 'class-validator';
import { BaseDto } from '../../common/base_dto';
import { IBodyDto } from '../../../interfaces';

/**
 * DTO for user registration
 */
export class RegisterDto extends BaseDto implements IBodyDto {
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password!: string;

  @IsString({ message: 'First name must be a string' })
  @IsOptional()
  first_name?: string;

  @IsString({ message: 'Last name must be a string' })
  @IsOptional()
  last_name?: string;

  constructor(data?: { email?: string; password?: string; first_name?: string; last_name?: string }) {
    super();
    if (data) {
      this.email = data.email || '';
      this.password = data.password || '';
      this.first_name = data.first_name;
      this.last_name = data.last_name;
    }
  }
}

