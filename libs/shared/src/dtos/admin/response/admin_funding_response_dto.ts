import { IAdminFunding } from '../../../interfaces/admin/IAdminFunding';
import { IsString, IsNumber, IsDate, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for admin funding response
 */
export class AdminFundingResponseDto implements IAdminFunding {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  user_id: string;

  @IsNumber()
  amount: number;

  @IsNumber()
  months_funded: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  start_date?: Date;

  @Type(() => Date)
  @IsDate()
  end_date: Date;

  @IsEnum(['active', 'expired', 'cancelled'])
  status: 'active' | 'expired' | 'cancelled';

  @IsOptional()
  @IsString()
  created_by?: string;

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
    first_name?: string;
    last_name?: string;
  };

  constructor(funding: IAdminFunding) {
    this.id = funding.id;
    this.user_id = funding.user_id;
    this.amount = funding.amount;
    this.months_funded = funding.months_funded;
    this.start_date = funding.start_date;
    this.end_date = funding.end_date;
    this.status = funding.status;
    this.created_by = funding.created_by;
    this.created_at = funding.created_at;
    this.updated_at = funding.updated_at;
    this.user = funding.user;
  }
}

