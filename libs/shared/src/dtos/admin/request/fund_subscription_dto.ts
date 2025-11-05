import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';
import { BaseDto } from '../../common/base_dto';
import { IBodyDto } from '../../../interfaces';

/**
 * DTO for funding a user subscription
 */
export class FundSubscriptionDto extends BaseDto implements IBodyDto {
  @IsString({ message: 'User ID must be a string' })
  @IsNotEmpty({ message: 'User ID is required' })
  userId!: string;

  @IsNumber({}, { message: 'Months must be a number' })
  @IsOptional()
  @Min(1, { message: 'Months must be at least 1' })
  months?: number;

  @IsNumber({}, { message: 'Amount must be a number' })
  @IsOptional()
  @Min(0, { message: 'Amount must be a positive number' })
  amount?: number;

  constructor(data?: { userId?: string; months?: number; amount?: number }) {
    super();
    if (data) {
      this.userId = data.userId || '';
      this.months = data.months;
      this.amount = data.amount;
    }
  }
}

