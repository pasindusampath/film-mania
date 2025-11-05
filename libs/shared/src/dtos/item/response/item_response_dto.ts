import { IItem } from "../../../interfaces/IItem";


/**
 * DTO for item response
 */
export class ItemResponseDto implements IItem {
  id: number;
  name: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(item: IItem) {
    this.id = item.id!;
    this.name = item.name;
    this.description = item.description;
    this.createdAt = item.createdAt;
    this.updatedAt = item.updatedAt;
  }
}

