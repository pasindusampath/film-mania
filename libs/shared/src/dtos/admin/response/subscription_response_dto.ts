import { ISubscription } from '../../../interfaces/admin/ISubscription';
import { SubscriptionStatus, PlanType } from '../../../enums';
import { IsString, IsBoolean, IsDate, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for subscription response
 */
export class SubscriptionResponseDto implements ISubscription {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  user_id: string;

  @IsOptional()
  @IsString()
  stripe_subscription_id?: string;

  @IsEnum(SubscriptionStatus)
  status: SubscriptionStatus;

  @IsEnum(PlanType)
  plan_type: PlanType;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  start_date?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  end_date?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  current_period_start?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  current_period_end?: Date;

  @IsBoolean()
  funded_by_admin: boolean;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  cancelled_at?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  created_at?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  updated_at?: Date;

  @IsOptional()
  user?: {
    id: string;
    email: string;
  };

  constructor(subscription: ISubscription) {
    this.id = subscription.id;
    this.user_id = subscription.user_id;
    this.stripe_subscription_id = subscription.stripe_subscription_id;
    this.status = subscription.status;
    this.plan_type = subscription.plan_type;
    this.start_date = subscription.start_date;
    this.end_date = subscription.end_date;
    this.current_period_start = subscription.current_period_start;
    this.current_period_end = subscription.current_period_end;
    this.funded_by_admin = subscription.funded_by_admin;
    this.cancelled_at = subscription.cancelled_at;
    this.created_at = subscription.created_at;
    this.updated_at = subscription.updated_at;
    this.user = subscription.user;
  }
}

