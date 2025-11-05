import { IsInt, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseDto } from '../common/base_dto';
import { IParamDto } from '../../interfaces';

/**
 * DTO for validating ID parameters in routes
 */
export class IdParamDto extends BaseDto implements IParamDto {
  @Type(() => Number)
  @IsInt({ message: 'ID must be an integer' })
  @IsPositive({ message: 'ID must be a positive number' })
  id!: number;

  constructor(data?: { id?: string | number }) {
    super();
    if (data?.id !== undefined) {
      this.id = typeof data.id === 'string' ? parseInt(data.id, 10) : data.id;
    }
  }
}

