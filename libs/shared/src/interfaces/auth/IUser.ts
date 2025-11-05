/**
 * User interface
 * Represents a user in the system
 */
export interface IUser {
  id?: string;
  email: string;
  first_name?: string;
  last_name?: string;
  subscription_status: string;
  is_admin?: boolean;
  is_active?: boolean;
  last_login?: Date;
  created_at?: Date;
  updated_at?: Date;
}

