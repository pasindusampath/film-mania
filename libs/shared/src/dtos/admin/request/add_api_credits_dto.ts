import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsDateString } from 'class-validator';
import { BaseDto } from '../../common/base_dto';
import { IBodyDto } from '../../../interfaces';

/**
 * DTO for adding API credits
 */
export class AddApiCreditsDto extends BaseDto implements IBodyDto {
  @IsString({ message: 'API provider must be a string' })
  @IsNotEmpty({ message: 'API provider is required' })
  apiProvider!: string;

  @IsNumber({}, { message: 'Credits must be a number' })
  @IsNotEmpty({ message: 'Credits is required' })
  @Min(1, { message: 'Credits must be at least 1' })
  credits!: number;

  @IsNumber({}, { message: 'Cost must be a number' })
  @IsOptional()
  @Min(0, { message: 'Cost must be a positive number' })
  cost?: number;

  @IsDateString({}, { message: 'Expiry date must be a valid date string' })
  @IsOptional()
  expiryDate?: string;

  constructor(data?: { apiProvider?: string; credits?: number; cost?: number; expiryDate?: string }) {
    super();
    if (data) {
      this.apiProvider = data.apiProvider || '';
      this.credits = data.credits || 0;
      this.cost = data.cost;
      this.expiryDate = data.expiryDate;
    }
  }
}

