import { IsString, IsNotEmpty } from 'class-validator';
import { BaseDto } from '../../common/base_dto';
import { IBodyDto } from '../../../interfaces';

/**
 * DTO for token refresh
 */
export class RefreshTokenDto extends BaseDto implements IBodyDto {
  @IsString({ message: 'Refresh token must be a string' })
  @IsNotEmpty({ message: 'Refresh token is required' })
  refreshToken!: string;

  constructor(data?: { refreshToken?: string }) {
    super();
    if (data) {
      this.refreshToken = data.refreshToken || '';
    }
  }
}

