/**
 * API Credit interface
 */
export interface IApiCredit {
  id?: string;
  api_provider: string;
  credits_purchased: number;
  credits_used: number;
  purchase_date?: Date;
  expiry_date?: Date;
  cost?: number;
  created_at?: Date;
  updated_at?: Date;
}

