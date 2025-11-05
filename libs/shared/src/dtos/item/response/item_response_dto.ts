import { IItem } from "../../../interfaces/IItem";
import { IsInt, IsString, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for item response
 */
export class ItemResponseDto implements IItem {
  @IsInt()
  id: number;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  createdAt?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  updatedAt?: Date;

  constructor(item: IItem) {
    this.id = item.id!;
    this.name = item.name;
    this.description = item.description;
    this.createdAt = item.createdAt;
    this.updatedAt = item.updatedAt;
  }
}

