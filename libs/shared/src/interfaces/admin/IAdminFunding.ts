/**
 * Admin Funding interface
 */
export interface IAdminFunding {
  id?: string;
  user_id: string;
  amount: number;
  months_funded: number;
  start_date?: Date;
  end_date: Date;
  status: 'active' | 'expired' | 'cancelled';
  created_by?: string;
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

