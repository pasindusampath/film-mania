/**
 * User interface
 * Represents a user profile in the system (personal data only)
 */
export interface IUser {
  id?: string;
  email: string;
  first_name?: string;
  last_name?: string;
  subscription_status: string;
  created_at?: Date;
  updated_at?: Date;
}

