/**
 * Base Item interface
 */
export interface IItem {
  id?: number;
  name: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

