import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { BaseDto } from '../../common/base_dto';
import { IBodyDto } from '../../../interfaces';

/**
 * DTO for creating a subscription
 */
export class CreateSubscriptionDto extends BaseDto implements IBodyDto {
  @IsString({ message: 'Price ID must be a string' })
  @IsNotEmpty({ message: 'Price ID is required' })
  priceId!: string;

  @IsString({ message: 'Payment method ID must be a string' })
  @IsOptional()
  paymentMethodId?: string;

  constructor(data?: { priceId?: string; paymentMethodId?: string }) {
    super();
    if (data) {
      this.priceId = data.priceId || '';
      this.paymentMethodId = data.paymentMethodId;
    }
  }
}

