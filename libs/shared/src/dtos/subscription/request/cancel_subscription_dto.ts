import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { BaseDto } from '../../common/base_dto';
import { IBodyDto } from '../../../interfaces';

/**
 * DTO for canceling a subscription
 */
export class CancelSubscriptionDto extends BaseDto implements IBodyDto {
  @IsString({ message: 'Subscription ID must be a string' })
  @IsOptional()
  subscriptionId?: string;

  @IsBoolean({ message: 'Cancel immediately must be a boolean' })
  @IsOptional()
  cancelImmediately?: boolean;

  constructor(data?: { subscriptionId?: string; cancelImmediately?: boolean }) {
    super();
    if (data) {
      this.subscriptionId = data.subscriptionId;
      this.cancelImmediately = data.cancelImmediately;
    }
  }
}

