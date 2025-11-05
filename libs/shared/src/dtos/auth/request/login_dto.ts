import { IsString, IsNotEmpty, IsEmail } from 'class-validator';
import { BaseDto } from '../../common/base_dto';
import { IBodyDto } from '../../../interfaces';

/**
 * DTO for user login
 */
export class LoginDto extends BaseDto implements IBodyDto {
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  password!: string;

  constructor(data?: { email?: string; password?: string }) {
    super();
    if (data) {
      this.email = data.email || '';
      this.password = data.password || '';
    }
  }
}

