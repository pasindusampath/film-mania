import { UserRole } from '../../enums';

/**
 * Auth interface
 * Represents authentication and authorization data for a user
 */
export interface IAuth {
  id?: string;
  user_id: string;
  password_hash: string;
  role: UserRole;
  is_active: boolean;
  last_login?: Date;
  created_at?: Date;
  updated_at?: Date;
  // Optional associations
  user?: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
  };
}

