import { IApiCredit } from '../../../interfaces/admin/IApiCredit';
import { IsString, IsNumber, IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for API credit response
 */
export class ApiCreditResponseDto implements IApiCredit {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  api_provider: string;

  @IsNumber()
  credits_purchased: number;

  @IsNumber()
  credits_used: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  purchase_date?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expiry_date?: Date;

  @IsOptional()
  @IsNumber()
  cost?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  created_at?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  updated_at?: Date;

  constructor(credit: IApiCredit) {
    this.id = credit.id;
    this.api_provider = credit.api_provider;
    this.credits_purchased = credit.credits_purchased;
    this.credits_used = credit.credits_used;
    this.purchase_date = credit.purchase_date;
    this.expiry_date = credit.expiry_date;
    this.cost = credit.cost;
    this.created_at = credit.created_at;
    this.updated_at = credit.updated_at;
  }
}

