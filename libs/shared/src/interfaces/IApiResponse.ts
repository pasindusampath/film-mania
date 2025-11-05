/**
 * Generic API Response interface
 */
export interface IApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
  details?: any;
}

